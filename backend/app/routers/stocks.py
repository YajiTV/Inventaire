from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.stock import StockCreate, StockRead, StockUpdate

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[StockRead])
def list_stocks() -> list[StockRead]:
    not_implemented()


@router.post("", response_model=StockRead, status_code=status.HTTP_201_CREATED)
def create_stock(payload: StockCreate) -> StockRead:
    not_implemented()


@router.get("/{stock_id}", response_model=StockRead)
def get_stock(stock_id: int) -> StockRead:
    not_implemented()


@router.patch("/{stock_id}", response_model=StockRead)
def update_stock(stock_id: int, payload: StockUpdate) -> StockRead:
    not_implemented()


@router.delete("/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock(stock_id: int) -> None:
    not_implemented()
