from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.schemas.common import ErrorResponse
from app.schemas.enums import UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import auth_service, user_service

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
) -> list[UserRead]:
    return user_service.list_users(db)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    try:
        return auth_service.register_user(db, payload)
    except auth_service.EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un compte existe deja avec cet email") from exc


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorise")
    try:
        return user_service.get_user(db, user_id)
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable") from exc


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    is_self = current_user.id == user_id
    is_admin = current_user.role == UserRole.ADMIN

    if not is_self and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorise")

    if is_self and not is_admin and (payload.role is not None or payload.is_active is not None):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que votre nom complet",
        )

    try:
        return user_service.update_user(db, user_id, payload)
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable") from exc


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
) -> None:
    try:
        user_service.delete_user(db, user_id)
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable") from exc
