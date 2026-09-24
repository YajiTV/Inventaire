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
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
    },
)

PRODUCT_NOT_FOUND = "Produit introuvable"
LOCATION_NOT_FOUND = "Emplacement introuvable"


# GET /stock-movements -> movement history, most recent first (200)
@router.get("", response_model=list[StockMovementRead])
def list_stock_movements(
    product_id: int | None = None,
    location_id: int | None = None,
    type: MovementType | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return stock_movement_service.list_stock_movements(db, product_id, location_id, type, limit)


# POST /stock-movements -> records the movement and moves the quantities (201),
# 404 on an unknown product or location, 409 when the source is short
@router.post("", response_model=StockMovementRead, status_code=status.HTTP_201_CREATED)
def create_stock_movement(
    payload: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Records a movement and updates the stock of the locations involved.
    Returns 409 when the source location does not hold enough quantity.
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
