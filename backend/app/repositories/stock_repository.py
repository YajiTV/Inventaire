from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stock import Stock


# Repository = the only layer talking to the database through the session.


def list_by_location(db: Session, location_id: int) -> list[Stock]:
    return list(db.execute(select(Stock).where(Stock.location_id == location_id)).scalars())


def exists_for_location(db: Session, location_id: int) -> bool:
    return db.execute(select(Stock.id).where(Stock.location_id == location_id).limit(1)).first() is not None


def get_by_product_and_location(
    db: Session, product_id: int, location_id: int, for_update: bool = False
) -> Stock | None:
    stmt = select(Stock).where(Stock.product_id == product_id, Stock.location_id == location_id)
    if for_update:
        # SELECT ... FOR UPDATE: PostgreSQL locks the row until the commit, so two
        # movements on the same stock line run one after the other instead of both
        # reading the same quantity. SQLite (tests) simply ignores it.
        stmt = stmt.with_for_update()
    return db.execute(stmt).scalar_one_or_none()


def get_by_id(db: Session, stock_id: int) -> Stock | None:
    # Lookup by primary key, None when absent.
    return db.get(Stock, stock_id)


def list_all(db: Session) -> list[Stock]:
    return list(db.execute(select(Stock)).scalars())


def create(db: Session, stock: Stock) -> Stock:
    db.add(stock)
    db.commit()
    db.refresh(stock)
    return stock


def save(db: Session, stock: Stock) -> Stock:
    db.commit()
    db.refresh(stock)
    return stock


def delete(db: Session, stock: Stock) -> None:
    db.delete(stock)
    db.commit()
