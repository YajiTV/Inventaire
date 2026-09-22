from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services import category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryRead]:
    return category_service.list_categories(db)


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> CategoryRead:
    try:
        return category_service.create_category(db, payload)
    except category_service.CategoryNameAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Une categorie porte deja ce nom") from exc


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: Session = Depends(get_db)) -> CategoryRead:
    try:
        return category_service.get_category(db, category_id)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categorie introuvable") from exc


@router.patch("/{category_id}", response_model=CategoryRead, responses={409: {"model": ErrorResponse}})
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)) -> CategoryRead:
    try:
        return category_service.update_category(db, category_id, payload)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categorie introuvable") from exc
    except category_service.CategoryNameAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Une categorie porte deja ce nom") from exc


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)) -> None:
    try:
        category_service.delete_category(db, category_id)
    except category_service.CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categorie introuvable") from exc
