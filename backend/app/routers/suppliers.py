from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.supplier import SupplierCreate, SupplierRead, SupplierUpdate
from app.services import supplier_service

# Documentation Swagger : chaque route a un "summary" (titre dans Swagger), un docstring (description
# détaillée), une "response_description" (la réponse en cas de succès) et ses codes d'erreur possibles.

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse, "description": "Unknown supplier"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)

SUPPLIER_NOT_FOUND = "Fournisseur introuvable"


# GET /suppliers -> liste de tous les fournisseurs (200)
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


# POST /suppliers -> création (201), Pydantic valide le body (sinon 422 automatique)
@router.post(
    "",
    response_model=SupplierRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a supplier",
    response_description="The created supplier",
    responses={404: {"description": "Not returned by this route"}},
)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    """Creates a supplier. Only `name` is required; `email` must be a valid address when given."""
    return supplier_service.create_supplier(db, payload)


# GET /suppliers/{id} -> un fournisseur (200) ou 404
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


# PATCH /suppliers/{id} -> modification partielle (200) ou 404
@router.patch(
    "/{supplier_id}",
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


# DELETE /suppliers/{id} -> suppression (204, pas de body) ou 404
@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a supplier",
    response_description="The supplier was deleted, no body",
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
