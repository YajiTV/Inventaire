from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.enums import OrderStatus
from app.schemas.order_line import OrderLineCreate, OrderLineRead, OrderLineUpdate
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderUpdate,
)
from app.services import (
    location_service,
    product_service,
    purchase_order_service,
    supplier_service,
)

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase orders"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
    },
)

ORDER_NOT_FOUND = "Commande introuvable"
SUPPLIER_NOT_FOUND = "Fournisseur introuvable"
LOCATION_NOT_FOUND = "Emplacement introuvable"
PRODUCT_NOT_FOUND = "Produit introuvable"


# GET /purchase-orders -> every order (200), optionally filtered by supplier or status
@router.get("", response_model=list[PurchaseOrderRead])
def list_purchase_orders(
    supplier_id: int | None = None,
    order_status: OrderStatus | None = None,
    db: Session = Depends(get_db),
):
    return purchase_order_service.list_purchase_orders(db, supplier_id, order_status)


# POST /purchase-orders -> creation with its lines (201), 404 on an unknown
# supplier or location, 409 on a reference already used
@router.post("", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)):
    try:
        return purchase_order_service.create_purchase_order(db, payload)
    except purchase_order_service.PurchaseOrderReferenceAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Cette référence de commande existe déjà"
        ) from exc
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc


# GET /purchase-orders/{id} -> one order with its lines (200) or 404
@router.get("/{order_id}", response_model=PurchaseOrderRead)
def get_purchase_order(order_id: int, db: Session = Depends(get_db)):
    try:
        return purchase_order_service.get_purchase_order(db, order_id)
    except purchase_order_service.PurchaseOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ORDER_NOT_FOUND) from exc


# PATCH /purchase-orders/{id} -> status or location change (200), 404 on an
# unknown order or location, 409 when the life cycle forbids the change
@router.patch("/{order_id}", response_model=PurchaseOrderRead)
def update_purchase_order(order_id: int, payload: PurchaseOrderUpdate, db: Session = Depends(get_db)):
    """Changing the status to "received" generates the incoming stock movements."""
    try:
        return purchase_order_service.update_purchase_order(db, order_id, payload)
    except purchase_order_service.PurchaseOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ORDER_NOT_FOUND) from exc
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except purchase_order_service.InvalidStatusTransitionError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ce changement de statut est impossible"
        ) from exc
    except purchase_order_service.PurchaseOrderNotEditableError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Une commande clôturée ne peut plus être modifiée"
        ) from exc


# DELETE /purchase-orders/{id} -> deletion with its lines (204), 404 on an
# unknown order, 409 on an order already sent or received
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(order_id: int, db: Session = Depends(get_db)) -> None:
    try:
        purchase_order_service.delete_purchase_order(db, order_id)
    except purchase_order_service.PurchaseOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ORDER_NOT_FOUND) from exc
    except purchase_order_service.PurchaseOrderNotDeletableError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une commande envoyée ou reçue ne peut pas être supprimée, elle doit être annulée",
        ) from exc


# Routes below: order line sub-resource, owned by the Order line resource.


@router.get("/{order_id}/lines", response_model=list[OrderLineRead])
def list_order_lines(order_id: int) -> list[OrderLineRead]:
    not_implemented()


@router.post("/{order_id}/lines", response_model=OrderLineRead, status_code=status.HTTP_201_CREATED)
def create_order_line(order_id: int, payload: OrderLineCreate) -> OrderLineRead:
    not_implemented()


@router.patch("/{order_id}/lines/{line_id}", response_model=OrderLineRead)
def update_order_line(order_id: int, line_id: int, payload: OrderLineUpdate) -> OrderLineRead:
    not_implemented()


@router.delete("/{order_id}/lines/{line_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_line(order_id: int, line_id: int) -> None:
    not_implemented()
