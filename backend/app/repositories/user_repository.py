from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def create(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def list_all(db: Session) -> list[User]:
    return list(db.execute(select(User)).scalars())

def save(db: Session, user: User) -> User:
    db.commit()
    db.refresh(user)
    return user

def delete(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
