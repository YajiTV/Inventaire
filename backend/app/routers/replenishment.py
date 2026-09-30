from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.purchase_order import PurchaseOrderRead
from app.schemas.replenishment import ReplenishmentRequest, ReplenishmentSuggestion
from app.services import (
    location_service,
    purchase_order_service,
    replenishment_service,
    supplier_service,
)

router = APIRouter(
    prefix="/replenishment",
    tags=["Replenishment"],
    dependencies=[Depends(get_current_user)],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token"},
        404: {"model": ErrorResponse, "description": "Resource not found"},
    },
)


@router.get(
    "/suggestions",
    response_model=list[ReplenishmentSuggestion],
    summary="List the products to reorder",
    response_description="Each product under its reorder threshold, with the quantity to order",
)
def list_suggestions(supplier_id: int | None = None, db: Session = Depends(get_db)):
    """
    Lists the products whose total quantity, over every location, is below
    their reorder threshold.

    The suggested quantity brings the stock back to twice the threshold.
    `supplier_id` is optional: without it, products with no supplier are
    listed too, with a null `supplier_id`, and cannot be ordered.
    """
    return replenishment_service.list_suggestions(db, supplier_id)


@router.post(
    "/orders",
    response_model=PurchaseOrderRead,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a purchase order from the suggestions",
    response_description="The created order, in status draft, with one line per product",
    responses={
        409: {"model": ErrorResponse, "description": "A product is not under its threshold or not sold by this supplier"},
    },
)
def create_replenishment_order(payload: ReplenishmentRequest, db: Session = Depends(get_db)):
    """
    Turns the suggestions of one supplier into a draft purchase order.

    Quantities are computed by the server, never taken from the client. A
    product that is no longer under its threshold, or that belongs to another
    supplier, is refused with 409 and no order is created.
    """
    try:
        return replenishment_service.create_replenishment_order(db, payload)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fournisseur introuvable") from exc
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emplacement introuvable") from exc
    except replenishment_service.ProductNotReplenishableError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un produit n'est pas sous son seuil ou n'appartient pas à ce fournisseur",
        ) from exc
    except purchase_order_service.PurchaseOrderReferenceAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Une commande identique vient d'être générée, réessayez"
        ) from exc