import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.models.user import User
from app.repositories import refresh_token_repository, user_repository
from app.schemas.enums import UserRole
from app.schemas.user import UserCreate
from app.services.password import hash_password, verify_password

settings = get_settings()


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidSessionError(Exception):
    """Raised for any refresh cookie that must not grant a new access token:
    missing record, already used (rotated away), or expired."""


def register_user(db: Session, payload: UserCreate, role: UserRole = UserRole.OPERATOR) -> User:
    if user_repository.get_by_email(db, payload.email) is not None:
        raise EmailAlreadyRegisteredError(payload.email)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=role,
        hashed_password=hash_password(payload.password),
    )
    return user_repository.create(db, user)


def authenticate(db: Session, email: str, password: str) -> User:
    user = user_repository.get_by_email(db, email)
    if user is None or not user.is_active or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError(email)
    return user


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# SQLite (tests) reads DateTime(timezone=True) back as naive, Postgres as aware.
# Every value is written as UTC, so a naive one is UTC too.
def _as_aware_utc(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def _hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _issue_refresh_token(db: Session, user_id: int) -> str:
    # Opaque random value, not a JWT: it only names a row in refresh_tokens,
    # which is what makes revocation possible.
    raw_token = secrets.token_urlsafe(32)
    expires_at = _utcnow() + timedelta(days=settings.refresh_token_expire_days)
    refresh_token_repository.create(db, user_id, _hash_refresh_token(raw_token), expires_at)
    return raw_token


def issue_tokens(db: Session, user: User) -> tuple[str, str]:
    return create_access_token(user.id), _issue_refresh_token(db, user.id)


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[str, str]:
    """Verifies a refresh cookie, revokes it, and issues a fresh access/refresh pair.

    Called on every `/auth/refresh`: the token just used can never be used
    again. A refresh token presented a second time is what a copied cookie
    looks like from the server's point of view, so it is treated as a
    possible theft: every other still-active session of that user is
    revoked too, not only the reused one.
    """
    now = _utcnow()
    record = refresh_token_repository.get_by_hash(db, _hash_refresh_token(raw_token))
    if record is None:
        raise InvalidSessionError("unknown token")

    if record.revoked_at is not None:
        refresh_token_repository.revoke_all_active_for_user(db, record.user_id, now)
        raise InvalidSessionError("reused token")

    if _as_aware_utc(record.expires_at) < now:
        raise InvalidSessionError("expired token")

    user = user_repository.get_by_id(db, record.user_id)
    if user is None or not user.is_active:
        raise InvalidSessionError("inactive user")

    refresh_token_repository.revoke(db, record, now)
    return create_access_token(user.id), _issue_refresh_token(db, user.id)


def revoke_refresh_token(db: Session, raw_token: str) -> None:
    """Used by /auth/logout. Silently does nothing for an unknown or already-revoked token."""
    record = refresh_token_repository.get_by_hash(db, _hash_refresh_token(raw_token))
    if record is not None and record.revoked_at is None:
        refresh_token_repository.revoke(db, record, _utcnow())
