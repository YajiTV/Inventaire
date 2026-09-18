from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.repositories import user_repository
from app.schemas.enums import UserRole
from app.schemas.user import UserCreate
from app.services.password import hash_password, verify_password


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidSessionError(Exception):
    pass


def register_user(db: Session, payload: UserCreate) -> User:
    if user_repository.get_by_email(db, payload.email) is not None:
        raise EmailAlreadyRegisteredError(payload.email)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=UserRole.OPERATOR,
        hashed_password=hash_password(payload.password),
    )
    return user_repository.create(db, user)


def authenticate(db: Session, email: str, password: str) -> User:
    user = user_repository.get_by_email(db, email)
    if user is None or not user.is_active or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError(email)
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    return create_access_token(user.id), create_refresh_token(user.id)


def refresh_access_token(db: Session, refresh_token: str) -> str:
    user_id = decode_token(refresh_token, expected_type="refresh")
    user = user_repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise InvalidSessionError(user_id)
    return create_access_token(user.id)
