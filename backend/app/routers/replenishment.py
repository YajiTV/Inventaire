from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.purchase_order import PurchaseOrderRead
from app.schemas.replenishment import ReplenishmentRequest, ReplenishmentSuggestion

router = APIRouter(
    prefix="/replenishment",
    tags=["Replenishment"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("/suggestions", response_model=list[ReplenishmentSuggestion])
def list_suggestions(supplier_id: int | None = None) -> list[ReplenishmentSuggestion]:
    """Lists the products whose total quantity is below their reorder threshold."""
    not_implemented()


@router.post("/orders", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_replenishment_order(payload: ReplenishmentRequest) -> PurchaseOrderRead:
    """Turns the suggestions of one supplier into a draft purchase order."""
    not_implemented()
