from sqlalchemy.orm import Session

from app.models.order_line import OrderLine
from app.models.purchase_order import PurchaseOrder
from app.repositories import order_line_repository
from app.schemas.enums import OrderStatus
from app.schemas.order_line import OrderLineCreate, OrderLineUpdate
from app.services import product_service, purchase_order_service


class OrderLineNotFoundError(Exception):
    pass


class OrderLinesLockedError(Exception):
    """Raised when the lines of an order that is no longer a draft are modified."""


class ProductAlreadyInOrderError(Exception):
    pass


class LastOrderLineError(Exception):
    """Raised when deleting the only line left, an order needs at least one."""


def _get_draft_order(db: Session, order_id: int) -> PurchaseOrder:
    order = purchase_order_service.get_purchase_order(db, order_id)
    if order.status != OrderStatus.DRAFT:
        raise OrderLinesLockedError(order.status)
    return order


def list_lines(db: Session, order_id: int) -> list[OrderLine]:
    return list(purchase_order_service.get_purchase_order(db, order_id).lines)


def create_line(db: Session, order_id: int, payload: OrderLineCreate) -> OrderLine:
    order = _get_draft_order(db, order_id)
    product_service.get_product(db, payload.product_id)
    if any(line.product_id == payload.product_id for line in order.lines):
        raise ProductAlreadyInOrderError(payload.product_id)

    line = OrderLine(
        order_id=order.id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
    )
    return order_line_repository.create(db, line)


def update_line(db: Session, order_id: int, line_id: int, payload: OrderLineUpdate) -> OrderLine:
    _get_draft_order(db, order_id)
    line = order_line_repository.get_in_order(db, order_id, line_id)
    if line is None:
        raise OrderLineNotFoundError(line_id)

    # product_id is not in OrderLineUpdate: changing the product means
    # deleting the line and creating another one.
    if payload.quantity is not None:
        line.quantity = payload.quantity
    if payload.unit_price is not None:
        line.unit_price = payload.unit_price
    return order_line_repository.save(db, line)


def delete_line(db: Session, order_id: int, line_id: int) -> None:
    order = _get_draft_order(db, order_id)
    line = order_line_repository.get_in_order(db, order_id, line_id)
    if line is None:
        raise OrderLineNotFoundError(line_id)
    if len(order.lines) == 1:
        raise LastOrderLineError(order_id)
    order_line_repository.delete(db, line)