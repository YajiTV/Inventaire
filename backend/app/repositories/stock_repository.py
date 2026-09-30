from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stock import Stock


def list_by_location(db: Session, location_id: int) -> list[Stock]:
    return list(db.execute(select(Stock).where(Stock.location_id == location_id)).scalars())


def exists_for_location(db: Session, location_id: int) -> bool:
    return db.execute(select(Stock.id).where(Stock.location_id == location_id).limit(1)).first() is not None

def get_by_product_and_location(db: Session, product_id: int, location_id: int) -> Stock | None:
    return db.execute(select(Stock).where(Stock.product_id == product_id, Stock.location_id == location_id )).scalar_one_or_none()

def get_by_id(db: Session, stock_id: int) -> Stock | None:
    return db.get(Stock, stock_id) #search primary key, none if absent

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

def delete(db: Session, stock: Stock) ->None:
    db.delete(stock)
    db.commit()
