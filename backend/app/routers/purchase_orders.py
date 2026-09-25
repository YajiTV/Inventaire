from fastapi import APIRouter, Depends, HTTPException, Query, status
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
        404: {"model": ErrorResponse, "description": "Resource not found"},
        409: {"model": ErrorResponse, "description": "The order life cycle forbids the operation"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)

ORDER_NOT_FOUND = "Commande introuvable"
SUPPLIER_NOT_FOUND = "Fournisseur introuvable"
LOCATION_NOT_FOUND = "Emplacement introuvable"
PRODUCT_NOT_FOUND = "Produit introuvable"


@router.get(
    "",
    response_model=list[PurchaseOrderRead],
    summary="List purchase orders",
    response_description="The orders, each one with its lines and its computed total",
    responses={404: {"description": "Not returned by this route"}},
)
def list_purchase_orders(
    supplier_id: int | None = Query(default=None, description="Keep only the orders of this supplier"),
    order_status: OrderStatus | None = Query(default=None, description="Keep only the orders in this status"),
    db: Session = Depends(get_db),
):
    """
    Returns every purchase order, newest first.

    Both filters are optional and combine with each other. An unknown supplier
    id is not an error here: it simply matches no order and returns an empty
    list.
    """
    return purchase_order_service.list_purchase_orders(db, supplier_id, order_status)


@router.post(
    "",
    response_model=PurchaseOrderRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a purchase order",
    response_description="The created order, in status draft, with its lines",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown supplier, location or product"},
        409: {"model": ErrorResponse, "description": "Reference already used by another order"},
    },
)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)):
    """
    Creates an order and its lines in one call.

    The order always starts in status `draft`, whatever the payload asks for,
    and at least one line is required. The reference must be unique across
    every order. `total_price` is computed from the lines and never stored.
    """
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


@router.get(
    "/{order_id}",
    response_model=PurchaseOrderRead,
    summary="Get a purchase order",
    response_description="The order with its lines and its computed total",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown order"},
        409: {"description": "Not returned by this route"},
    },
)
def get_purchase_order(order_id: int, db: Session = Depends(get_db)):
    """Returns one order, its lines included."""
    try:
        return purchase_order_service.get_purchase_order(db, order_id)
    except purchase_order_service.PurchaseOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ORDER_NOT_FOUND) from exc


@router.patch(
    "/{order_id}",
    response_model=PurchaseOrderRead,
    summary="Update the status or the location of an order",
    response_description="The updated order",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown order or location"},
        409: {"model": ErrorResponse, "description": "Invalid status transition, or order already closed"},
    },
)
def update_purchase_order(order_id: int, payload: PurchaseOrderUpdate, db: Session = Depends(get_db)):
    """
    Moves the order along its life cycle, or changes its delivery location.

    Allowed transitions: `draft` -> `sent` -> `received`, and `draft` or `sent`
    -> `cancelled`. Any other transition returns 409, and a `received` or
    `cancelled` order is closed: neither its status nor its location can change
    any more.

    Moving to `received` is the side of the feature that touches the stock: it
    generates one incoming movement per line and stamps `received_at`.
    """
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


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a draft purchase order",
    response_description="Deleted, no body returned",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown order"},
        409: {"model": ErrorResponse, "description": "The order is already sent or received"},
    },
)
def delete_purchase_order(order_id: int, db: Session = Depends(get_db)) -> None:
    """
    Deletes an order and its lines.

    Only a `draft` or `cancelled` order can be deleted. A `sent` or `received`
    order is part of the stock history and must be cancelled instead.
    """
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
