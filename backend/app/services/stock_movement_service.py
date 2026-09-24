from sqlalchemy.orm import Session

from app.models.stock import Stock
from app.models.stock_movement import StockMovement
from app.repositories import stock_movement_repository, stock_repository
from app.schemas.enums import MovementType
from app.schemas.stock_movement import StockMovementCreate
from app.services import location_service, product_service


class InsufficientStockError(Exception):
    """Raised when a location does not hold enough quantity for an outgoing movement."""


def list_stock_movements(
    db: Session,
    product_id: int | None = None,
    location_id: int | None = None,
    movement_type: MovementType | None = None,
    limit: int = 50,
) -> list[StockMovement]:
    return stock_movement_repository.list_all(db, product_id, location_id, movement_type, limit)


def create_stock_movement(db: Session, payload: StockMovementCreate, user_id: int) -> StockMovement:
    """
    Records the movement and updates the stock of the locations involved.

    The schema already guarantees which locations are present for each type, so
    only the business rules are checked here: the product and the locations must
    exist, and a location can never go negative.
    """
    product_service.get_product(db, payload.product_id)
    for location_id in (payload.source_location_id, payload.target_location_id):
        if location_id is not None:
            location_service.get_location(db, location_id)

    # A transfer is an outgoing movement followed by an incoming one, so both
    # sides go through the same two helpers.
    if payload.source_location_id is not None:
        _remove_quantity(db, payload.product_id, payload.source_location_id, payload.quantity)
    if payload.target_location_id is not None:
        _add_quantity(db, payload.product_id, payload.target_location_id, payload.quantity)

    movement = StockMovement(
        product_id=payload.product_id,
        type=payload.type,
        quantity=payload.quantity,
        source_location_id=payload.source_location_id,
        target_location_id=payload.target_location_id,
        reason=payload.reason,
        user_id=user_id,
    )
    # Single commit: either the movement and the new quantities are both
    # written, or nothing is.
    return stock_movement_repository.create(db, movement)


def _remove_quantity(db: Session, product_id: int, location_id: int, quantity: int) -> None:
    stock = stock_repository.get_by_product_and_location(db, product_id, location_id)
    if stock is None or stock.quantity < quantity:
        available = 0 if stock is None else stock.quantity
        raise InsufficientStockError(location_id, available, quantity)
    stock.quantity -= quantity


def _add_quantity(db: Session, product_id: int, location_id: int, quantity: int) -> None:
    stock = stock_repository.get_by_product_and_location(db, product_id, location_id)
    if stock is None:
        # First time this product enters this location: the stock line is created.
        stock = Stock(product_id=product_id, location_id=location_id, quantity=quantity)
        stock_movement_repository.stage(db, stock)
        return
    stock.quantity += quantity
