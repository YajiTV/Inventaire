from sqlalchemy.orm import Session

from app.models.stock import Stock
from app.repositories import stock_repository
from app.schemas.stock import StockCreate, StockUpdate
from app.services import location_service

class StockNotFoundError(Exception):
    pass

class StockAlreadyExistsError(Exception):
    pass

def list_stocks(db: Session) -> list[Stock]:
    return stock_repository.list_all(db)

def get_stock(db: Session, stock_id: int) -> Stock:
    stock = stock_repository.get_by_id(db, stock_id)
    if stock is None:
        raise StockNotFoundError(stock_id)
    return stock

def create_stock(db: Session, payload: StockCreate) -> Stock:
    location_service.get_location(db, payload.location_id)
    if stock_repository.get_by_product_and_location(db, payload.product_id, payload.location_id) is not None:
        raise StockAlreadyExistsError((payload.product_id, payload.location_id))
    stock = Stock(product_id = payload.product_id, location_id = payload.location_id, quantity = payload.quantity)
    return stock_repository.create(db, stock)

def update_stock(db: Session, stock_id: int, payload: StockUpdate) -> Stock:
    stock = get_stock(db, stock_id)
    if payload.quantity is not None:
        stock.quantity = payload.quantity
    return stock_repository.save(db, stock)

def delete_stock(db: Session, stock_id: int)-> None:
    stock = get_stock(db, stock_id)
    stock_repository.delete(db, stock)
