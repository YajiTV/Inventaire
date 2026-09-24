from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.supplier import SupplierCreate, SupplierRead, SupplierUpdate
from app.services import supplier_service

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


# GET /suppliers -> liste de tous les fournisseurs (200)
@router.get("", response_model=list[SupplierRead])
def list_suppliers(db: Session = Depends(get_db)):
    return supplier_service.list_suppliers(db)


# POST /suppliers -> création (201), Pydantic valide le body (sinon 422 automatique)
@router.post("", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    return supplier_service.create_supplier(db, payload)


# GET /suppliers/{id} -> un fournisseur (200) ou 404
@router.get("/{supplier_id}", response_model=SupplierRead)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    try:
        return supplier_service.get_supplier(db, supplier_id)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fournisseur introuvable") from exc


# PATCH /suppliers/{id} -> modification partielle (200) ou 404
@router.patch("/{supplier_id}", response_model=SupplierRead)
def update_supplier(supplier_id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    try:
        return supplier_service.update_supplier(db, supplier_id, payload)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fournisseur introuvable") from exc


# DELETE /suppliers/{id} -> suppression (204, pas de body) ou 404
@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)) -> None:
    try:
        supplier_service.delete_supplier(db, supplier_id)
    except supplier_service.SupplierNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fournisseur introuvable") from exc
