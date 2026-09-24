from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.order_line import OrderLine
from app.models.purchase_order import PurchaseOrder
from app.repositories import purchase_order_repository
from app.schemas.enums import OrderStatus
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate
from app.services import location_service, product_service, supplier_service


class PurchaseOrderNotFoundError(Exception):
    pass


class PurchaseOrderReferenceAlreadyExistsError(Exception):
    pass


class InvalidStatusTransitionError(Exception):
    """Raised when the requested status cannot follow the current one."""


class PurchaseOrderNotEditableError(Exception):
    """Raised when a closed order (received or cancelled) is modified."""


class PurchaseOrderNotDeletableError(Exception):
    """Raised when deleting an order would lose a trace that must be kept."""


# Order life cycle. A status with an empty set is final.
ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.DRAFT: {OrderStatus.SENT, OrderStatus.CANCELLED},
    OrderStatus.SENT: {OrderStatus.RECEIVED, OrderStatus.CANCELLED},
    OrderStatus.RECEIVED: set(),
    OrderStatus.CANCELLED: set(),
}

# An order that has been sent to the supplier or received is part of the audit
# trail: it is cancelled, not deleted.
DELETABLE_STATUSES = {OrderStatus.DRAFT, OrderStatus.CANCELLED}

CLOSED_STATUSES = {OrderStatus.RECEIVED, OrderStatus.CANCELLED}


def list_purchase_orders(
    db: Session,
    supplier_id: int | None = None,
    order_status: OrderStatus | None = None,
) -> list[PurchaseOrder]:
    return purchase_order_repository.list_all(db, supplier_id, order_status)


def get_purchase_order(db: Session, order_id: int) -> PurchaseOrder:
    order = purchase_order_repository.get_by_id(db, order_id)
    if order is None:
        raise PurchaseOrderNotFoundError(order_id)
    return order


def create_purchase_order(db: Session, payload: PurchaseOrderCreate) -> PurchaseOrder:
    if purchase_order_repository.get_by_reference(db, payload.reference) is not None:
        raise PurchaseOrderReferenceAlreadyExistsError(payload.reference)

    # Each of these raises its own not-found error, which the router maps to
    # a 404: an order must never reference a row that does not exist.
    supplier_service.get_supplier(db, payload.supplier_id)
    location_service.get_location(db, payload.location_id)
    for line in payload.lines:
        product_service.get_product(db, line.product_id)

    order = PurchaseOrder(
        reference=payload.reference,
        supplier_id=payload.supplier_id,
        location_id=payload.location_id,
        status=OrderStatus.DRAFT,
        lines=[
            OrderLine(
                product_id=line.product_id,
                quantity=line.quantity,
                unit_price=line.unit_price,
            )
            for line in payload.lines
        ],
    )
    return purchase_order_repository.create(db, order)


def update_purchase_order(
    db: Session, order_id: int, payload: PurchaseOrderUpdate
) -> PurchaseOrder:
    order = get_purchase_order(db, order_id)

    if payload.location_id is not None and payload.location_id != order.location_id:
        if order.status in CLOSED_STATUSES:
            raise PurchaseOrderNotEditableError(order.status)
        location_service.get_location(db, payload.location_id)
        order.location_id = payload.location_id

    if payload.status is not None and payload.status != order.status:
        apply_status(order, payload.status)

    return purchase_order_repository.save(db, order)


def apply_status(order: PurchaseOrder, new_status: OrderStatus) -> None:
    """Move the order to new_status, refusing any transition the life cycle forbids."""
    if new_status not in ALLOWED_TRANSITIONS[order.status]:
        raise InvalidStatusTransitionError(order.status, new_status)

    order.status = new_status
    if new_status is OrderStatus.RECEIVED:
        order.received_at = datetime.now(timezone.utc)


def delete_purchase_order(db: Session, order_id: int) -> None:
    order = get_purchase_order(db, order_id)
    if order.status not in DELETABLE_STATUSES:
        raise PurchaseOrderNotDeletableError(order.status)
    # The lines are removed with the order (delete-orphan cascade).
    purchase_order_repository.delete(db, order)
