from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order_line import OrderLine


# Repository = the only layer talking to the database through the session.


def get_in_order(db: Session, order_id: int, line_id: int) -> OrderLine | None:
    # Filtering on both ids: a line id that belongs to another order must
    # look like it does not exist, not leak across orders.
    stmt = select(OrderLine).where(OrderLine.id == line_id, OrderLine.order_id == order_id)
    return db.execute(stmt).scalar_one_or_none()


def create(db: Session, line: OrderLine) -> OrderLine:
    db.add(line)
    db.commit()
    db.refresh(line)
    return line


def save(db: Session, line: OrderLine) -> OrderLine:
    db.commit()
    db.refresh(line)
    return line


def delete(db: Session, line: OrderLine) -> None:
    db.delete(line)
    db.commit()
