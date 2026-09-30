from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
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
        401: {"model": ErrorResponse, "description": "Missing or invalid token (write routes only, reads are public)"},
        404: {"model": ErrorResponse, "description": "Resource not found"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)


@router.get(
    "",
    response_model=list[StockRead],
    summary="List stock lines",
    response_description="Every stock line, one per product and location",
    responses={404: {"description": "Not returned by this route"}},
)
def list_stocks(db: Session = Depends(get_db)) -> list[StockRead]:
    """Returns the quantity held for each product at each location."""
    return stock_service.list_stocks(db)


@router.post(
    "",
    dependencies=[Depends(get_current_user)],
    response_model=StockRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a stock line",
    response_description="The created stock line",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown product or location"},
        409: {"model": ErrorResponse, "description": "A stock line already exists for this product at this location"},
    },
)
def create_stock(payload: StockCreate, db: Session = Depends(get_db)) -> StockRead:
    """
    Registers the quantity of a product at a location.

    A product has at most one stock line per location: a second one for the
    same pair is refused with 409. The quantity can be zero, never negative.
    """
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


@router.get(
    "/{stock_id}",
    response_model=StockRead,
    summary="Get a stock line",
    response_description="The stock line",
    responses={404: {"model": ErrorResponse, "description": "Unknown stock line"}},
)
def get_stock(stock_id: int, db: Session = Depends(get_db)) -> StockRead:
    """Returns one stock line."""
    try:
        return stock_service.get_stock(db, stock_id)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc


@router.patch(
    "/{stock_id}",
    dependencies=[Depends(get_current_user)],
    response_model=StockRead,
    summary="Correct the quantity of a stock line",
    response_description="The updated stock line",
    responses={404: {"model": ErrorResponse, "description": "Unknown stock line"}},
)
def update_stock(stock_id: int, payload: StockUpdate, db: Session = Depends(get_db)) -> StockRead:
    """
    Sets the quantity directly, as an inventory correction.

    The product and the location of a stock line cannot change. To move goods
    and keep a trace of who did it, use `POST /stock-movements` instead.
    """
    try:
        return stock_service.update_stock(db, stock_id, payload)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc


@router.delete(
    "/{stock_id}",
    dependencies=[Depends(get_current_user)],
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a stock line",
    response_description="The stock line is deleted",
    responses={404: {"model": ErrorResponse, "description": "Unknown stock line"}},
)
def delete_stock(stock_id: int, db: Session = Depends(get_db)) -> None:
    """Deletes one stock line. The product and the location are kept."""
    try:
        stock_service.delete_stock(db, stock_id)
    except stock_service.StockNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=STOCK_NOT_FOUND) from exc
