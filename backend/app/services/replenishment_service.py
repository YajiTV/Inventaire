from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder
from app.repositories import replenishment_repository
from app.schemas.order_line import OrderLineCreate
from app.schemas.purchase_order import PurchaseOrderCreate
from app.schemas.replenishment import ReplenishmentRequest, ReplenishmentSuggestion
from app.services import location_service, purchase_order_service, supplier_service


class ProductNotReplenishableError(Exception):
    """Raised when a requested product is not under its threshold, or not sold by the supplier."""


def compute_suggested_quantity(reorder_threshold: int, current_quantity: int) -> int:
    # Business rule, kept in one place: bring the stock back to twice its
    # threshold. Only called for a product below its threshold, so the result
    # is always strictly positive.
    return 2 * reorder_threshold - current_quantity


def list_suggestions(db: Session, supplier_id: int | None = None) -> list[ReplenishmentSuggestion]:
    return [
        ReplenishmentSuggestion(
            product_id=product.id,
            product_name=product.name,
            supplier_id=product.supplier_id,
            current_quantity=quantity,
            reorder_threshold=product.reorder_threshold,
            suggested_quantity=compute_suggested_quantity(product.reorder_threshold, quantity),
        )
        for product, quantity in replenishment_repository.list_below_threshold(db, supplier_id)
    ]


def create_replenishment_order(db: Session, payload: ReplenishmentRequest) -> PurchaseOrder:
    # Each of these raises its own not-found error, mapped to a 404 by the router.
    supplier_service.get_supplier(db, payload.supplier_id)
    location_service.get_location(db, payload.location_id)

    # The candidates are recomputed on the server side: the client only says
    # which ones it wants, never how much, so a stale screen cannot order
    # a product that has been restocked in the meantime.
    candidates = {
        product.id: (product, quantity)
        for product, quantity in replenishment_repository.list_below_threshold(db, payload.supplier_id)
    }

    lines = []
    # dict.fromkeys removes duplicate ids while keeping the order.
    for product_id in dict.fromkeys(payload.product_ids):
        if product_id not in candidates:
            raise ProductNotReplenishableError(product_id)
        product, quantity = candidates[product_id]
        lines.append(
            OrderLineCreate(
                product_id=product.id,
                quantity=compute_suggested_quantity(product.reorder_threshold, quantity),
                # Product only carries a selling price: it is the best price
                # we have until a purchase price exists.
                unit_price=product.unit_price,
            )
        )

    reference = f"REAPPRO-{payload.supplier_id}-{datetime.now(timezone.utc):%Y%m%d%H%M%S%f}"
    order = PurchaseOrderCreate(
        reference=reference,
        supplier_id=payload.supplier_id,
        location_id=payload.location_id,
        lines=lines,
    )
    return purchase_order_service.create_purchase_order(db, order)