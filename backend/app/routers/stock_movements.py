from fastapi import APIRouter, Query, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.enums import MovementType
from app.schemas.stock_movement import StockMovementCreate, StockMovementRead

router = APIRouter(
    prefix="/stock-movements",
    tags=["Stock movements"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[StockMovementRead])
def list_stock_movements(
    product_id: int | None = None,
    location_id: int | None = None,
    type: MovementType | None = None,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[StockMovementRead]:
    not_implemented()


@router.post("", response_model=StockMovementRead, status_code=status.HTTP_201_CREATED)
def create_stock_movement(payload: StockMovementCreate) -> StockMovementRead:
    """
    Records a movement and updates the stock of the locations involved.
    Returns 409 when the source location does not hold enough quantity.
    """
    not_implemented()
