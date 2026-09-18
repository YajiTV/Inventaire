from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import auth_service

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[UserRead])
def list_users() -> list[UserRead]:
    not_implemented()


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    try:
        return auth_service.register_user(db, payload)
    except auth_service.EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un compte existe deja avec cet email") from exc


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int) -> UserRead:
    not_implemented()


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate) -> UserRead:
    not_implemented()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int) -> None:
    not_implemented()
