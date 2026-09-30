from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.supplier import SupplierCreate, SupplierRead, SupplierUpdate
from app.services import supplier_service


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token (write routes only, reads are public)"},
        404: {"model": ErrorResponse, "description": "Unknown supplier"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)

SUPPLIER_NOT_FOUND = "Fournisseur introuvable"


@router.get(
    "",
    response_model=list[SupplierRead],
    summary="List the suppliers",
    response_description="Every supplier",
    responses={404: {"description": "Not returned by this route"}},
)
def list_suppliers(db: Session = Depends(get_db)):
    """Returns every supplier."""
    return supplier_service.list_suppliers(db)


@router.post(
    "",
    dependencies=[Depends(get_current_user)],
    response_model=SupplierRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a supplier",
    response_description="The created supplier",
    responses={404: {"description": "Not returned by this route"}},
)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    """Creates a supplier. Only `name` is required; `email` must be a valid address when given."""
    return supplier_service.create_supplier(db, payload)


@router.get(
    "/{supplier_id}",
    response_model=SupplierRead,
    summary="Get a supplier",
    response_description="The supplier",
)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Returns one supplier by its id."""
    try:
        return supplier_service.get_supplier(db, supplier_id)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc


@router.patch(
    "/{supplier_id}",
    dependencies=[Depends(get_current_user)],
    response_model=SupplierRead,
    summary="Update a supplier",
    response_description="The updated supplier",
)
def update_supplier(supplier_id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    """Partially updates a supplier: only the fields sent in the body are changed."""
    try:
        return supplier_service.update_supplier(db, supplier_id, payload)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc


@router.delete(
    "/{supplier_id}",
    dependencies=[Depends(get_current_user)],
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a supplier",
    response_description="The supplier was deleted, no body",
    responses={409: {"model": ErrorResponse, "description": "The supplier still has purchase orders"}},
)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)) -> None:
    """
    Deletes a supplier by its id.

    Its products are kept: their `supplier_id` becomes `null`.
    """
    try:
        supplier_service.delete_supplier(db, supplier_id)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc
