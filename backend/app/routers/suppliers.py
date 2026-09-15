from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.supplier import SupplierCreate, SupplierRead, SupplierUpdate

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[SupplierRead])
def list_suppliers() -> list[SupplierRead]:
    not_implemented()


@router.post("", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
def create_supplier(payload: SupplierCreate) -> SupplierRead:
    not_implemented()


@router.get("/{supplier_id}", response_model=SupplierRead)
def get_supplier(supplier_id: int) -> SupplierRead:
    not_implemented()


@router.patch("/{supplier_id}", response_model=SupplierRead)
def update_supplier(supplier_id: int, payload: SupplierUpdate) -> SupplierRead:
    not_implemented()


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int) -> None:
    not_implemented()
