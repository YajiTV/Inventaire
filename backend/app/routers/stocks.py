from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.stock import StockCreate, StockRead, StockUpdate
from app.services import location_service, product_service, stock_service

STOCK_NOT_FOUND = "Stock introuvable"
PRODUCT_NOT_FOUND = "Produit introuvable"
LOCATION_NOT_FOUND = "Emplacement introuvable"

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[StockRead])
def list_stocks(db: Session = Depends(get_db)) -> list[StockRead]:
    return stock_service.list_stocks(db)


@router.post("", response_model=StockRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_stock(payload: StockCreate, db: Session = Depends(get_db)) -> StockRead:
    try:
        return stock_service.create_stock(db, payload)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except stock_service.StockAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un stock existe déjà pour ce produit à cet emplacement",
        ) from exc


@router.get("/{stock_id}", response_model=StockRead)
def get_stock(stock_id: int, db: Session = Depends(get_db)) -> StockRead:
    try:
        return stock_service.get_stock(db, stock_id)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc


@router.patch("/{stock_id}", response_model=StockRead)
def update_stock(stock_id: int, payload: StockUpdate, db: Session = Depends(get_db)) -> StockRead:
    try:
        return stock_service.update_stock(db, stock_id, payload)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc


@router.delete("/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock(stock_id: int, db: Session = Depends(get_db)) -> None:
    try:
        stock_service.delete_stock(db, stock_id)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc
