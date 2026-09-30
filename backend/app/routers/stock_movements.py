from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ErrorResponse
from app.schemas.enums import MovementType
from app.schemas.stock_movement import StockMovementCreate, StockMovementRead
from app.services import location_service, product_service, stock_movement_service

router = APIRouter(
    prefix="/stock-movements",
    tags=["Stock movements"],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token"},
        404: {"model": ErrorResponse, "description": "Resource not found"},
        409: {"model": ErrorResponse, "description": "The movement would break the stock"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)

PRODUCT_NOT_FOUND = "Produit introuvable"
LOCATION_NOT_FOUND = "Emplacement introuvable"


@router.get(
    "",
    response_model=list[StockMovementRead],
    summary="List the stock movements",
    response_description="The movements, most recent first",
    responses={
        404: {"description": "Not returned by this route"},
        409: {"description": "Not returned by this route"},
    },
)
def list_stock_movements(
    product_id: int | None = Query(default=None, description="Keep only the movements of this product"),
    location_id: int | None = Query(
        default=None, description="Keep only the movements whose source or destination is this location"
    ),
    type: MovementType | None = Query(default=None, description="Keep only this kind of movement"),
    limit: int = Query(default=50, ge=1, le=200, description="How many movements to return"),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    Returns the movement history, most recent first.

    Every filter is optional and they combine with each other. A `location_id`
    matches a movement whether that location is its source or its destination,
    so a transfer shows up on both sides.
    """
    return stock_movement_service.list_stock_movements(db, product_id, location_id, type, limit)


@router.post(
    "",
    response_model=StockMovementRead,
    status_code=status.HTTP_201_CREATED,
    summary="Record a stock movement",
    response_description="The recorded movement, quantities already applied",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown product or location"},
        409: {"model": ErrorResponse, "description": "The source location does not hold enough quantity"},
    },
)
def create_stock_movement(
    payload: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Records a movement and updates the stock of the locations involved.

    Three kinds of movement, each one with its own required locations:

    - `incoming`: needs `to_location_id`, adds the quantity, creates the stock
      line if that product had none at that location yet.
    - `outgoing`: needs `from_location_id`, removes the quantity.
    - `transfer`: needs both, removes on one side and adds on the other.

    Stock never goes negative: an `outgoing` or a `transfer` larger than what
    the source holds is refused with 409 and nothing is written. The movement
    is stamped with the authenticated user, so the history says who did what.
    """
    try:
        return stock_movement_service.create_stock_movement(db, payload, current_user.id)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except stock_movement_service.InsufficientStockError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Stock insuffisant sur l'emplacement d'origine",
        ) from exc
