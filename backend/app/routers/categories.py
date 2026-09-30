from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services import category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token (write routes only, reads are public)"},
        404: {"model": ErrorResponse, "description": "Unknown category"},
        422: {"description": "Invalid body, rejected by Pydantic"},
    },
)

CATEGORY_NOT_FOUND = "Categorie introuvable"
CATEGORY_NAME_TAKEN = "Une categorie porte deja ce nom"


@router.get(
    "",
    response_model=list[CategoryRead],
    summary="List the categories",
    response_description="Every category",
    responses={404: {"description": "Not returned by this route"}},
)
def list_categories(db: Session = Depends(get_db)) -> list[CategoryRead]:
    """Returns every category, used to classify the products."""
    return category_service.list_categories(db)


@router.post(
    "",
    dependencies=[Depends(get_current_user)],
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a category",
    response_description="The created category",
    responses={409: {"model": ErrorResponse, "description": "A category already uses this name"}},
)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> CategoryRead:
    """Creates a category. Two categories cannot share the same name."""
    try:
        return category_service.create_category(db, payload)
    except category_service.CategoryNameAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=CATEGORY_NAME_TAKEN) from exc


@router.get(
    "/{category_id}",
    response_model=CategoryRead,
    summary="Get a category",
    response_description="The category",
)
def get_category(category_id: int, db: Session = Depends(get_db)) -> CategoryRead:
    """Returns one category by its id."""
    try:
        return category_service.get_category(db, category_id)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CATEGORY_NOT_FOUND) from exc


@router.patch(
    "/{category_id}",
    dependencies=[Depends(get_current_user)],
    response_model=CategoryRead,
    summary="Update a category",
    response_description="The updated category",
    responses={409: {"model": ErrorResponse, "description": "A category already uses this name"}},
)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)) -> CategoryRead:
    """Partially updates a category: only the fields sent in the body are changed."""
    try:
        return category_service.update_category(db, category_id, payload)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CATEGORY_NOT_FOUND) from exc
    except category_service.CategoryNameAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=CATEGORY_NAME_TAKEN) from exc


@router.delete(
    "/{category_id}",
    dependencies=[Depends(get_current_user)],
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category",
    response_description="The category was deleted, no body",
    responses={409: {"model": ErrorResponse, "description": "The category still has products"}},
)
def delete_category(category_id: int, db: Session = Depends(get_db)) -> None:
    """Deletes a category. Refused while products still belong to it."""
    try:
        category_service.delete_category(db, category_id)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CATEGORY_NOT_FOUND) from exc
