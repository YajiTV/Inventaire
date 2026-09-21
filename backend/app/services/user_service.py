from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories import user_repository
from app.schemas.user import UserUpdate


class UserNotFoundError(Exception):
    pass


def list_users(db: Session) -> list[User]:
    return user_repository.list_all(db)


def get_user(db: Session, user_id: int) -> User:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    return user


def update_user(db: Session, user_id: int, payload: UserUpdate) -> User:
    user = get_user(db, user_id)
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    return user_repository.save(db, user)


def delete_user(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    user_repository.delete(db, user)
