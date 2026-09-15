from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[CategoryRead])
def list_categories() -> list[CategoryRead]:
    not_implemented()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate) -> CategoryRead:
    not_implemented()


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int) -> CategoryRead:
    not_implemented()


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, payload: CategoryUpdate) -> CategoryRead:
    not_implemented()


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int) -> None:
    not_implemented()
