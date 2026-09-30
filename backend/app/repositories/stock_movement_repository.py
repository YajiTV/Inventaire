from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.stock_movement import StockMovement
from app.schemas.enums import MovementType


# Repository = the only layer talking to the database through the session.


def list_all(
    db: Session,
    product_id: int | None = None,
    location_id: int | None = None,
    movement_type: MovementType | None = None,
    limit: int = 50,
) -> list[StockMovement]:
    stmt = select(StockMovement)
    if product_id is not None:
        stmt = stmt.where(StockMovement.product_id == product_id)
    if location_id is not None:
        # A location matches whether the goods left it or arrived in it.
        stmt = stmt.where(
            or_(
                StockMovement.source_location_id == location_id,
                StockMovement.target_location_id == location_id,
            )
        )
    if movement_type is not None:
        stmt = stmt.where(StockMovement.type == movement_type)
    stmt = stmt.order_by(StockMovement.created_at.desc(), StockMovement.id.desc()).limit(limit)
    return list(db.execute(stmt).scalars().all())


def stage(db: Session, instance: object) -> None:
    """
    Queues an object without committing, so the movement and the stock rows it
    touches are written by the caller's single commit, or not at all.

    The flush sends the INSERT inside the open transaction: a stock line created
    here is then visible to the next lookup of the same request.
    """
    db.add(instance)
    db.flush()


def create(db: Session, movement: StockMovement) -> StockMovement:
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement
