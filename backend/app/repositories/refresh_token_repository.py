from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


# Repository = the only layer talking to the database through the session.


def create(db: Session, user_id: int, token_hash: str, expires_at: datetime) -> RefreshToken:
    record = RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_by_hash(db: Session, token_hash: str) -> RefreshToken | None:
    stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    return db.execute(stmt).scalar_one_or_none()


def revoke(db: Session, record: RefreshToken, revoked_at: datetime) -> None:
    record.revoked_at = revoked_at
    db.commit()


def revoke_all_active_for_user(db: Session, user_id: int, revoked_at: datetime) -> None:
    stmt = select(RefreshToken).where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
    for record in db.execute(stmt).scalars():
        record.revoked_at = revoked_at
    db.commit()
