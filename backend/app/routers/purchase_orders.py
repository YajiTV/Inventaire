from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.enums import OrderStatus
from app.schemas.order_line import OrderLineCreate, OrderLineRead, OrderLineUpdate
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderUpdate,
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


@router.get("", response_model=list[PurchaseOrderRead])
def list_purchase_orders(
    supplier_id: int | None = None,
    order_status: OrderStatus | None = None,
) -> list[PurchaseOrderRead]:
    not_implemented()


@router.post("", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_purchase_order(payload: PurchaseOrderCreate) -> PurchaseOrderRead:
    not_implemented()


@router.get("/{order_id}", response_model=PurchaseOrderRead)
def get_purchase_order(order_id: int) -> PurchaseOrderRead:
    not_implemented()


@router.patch("/{order_id}", response_model=PurchaseOrderRead)
def update_purchase_order(order_id: int, payload: PurchaseOrderUpdate) -> PurchaseOrderRead:
    """Changing the status to "received" generates the incoming stock movements."""
    not_implemented()


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(order_id: int) -> None:
    not_implemented()


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
