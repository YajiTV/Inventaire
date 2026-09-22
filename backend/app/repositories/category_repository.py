from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category


def get_by_id(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def get_by_name(db: Session, name: str) -> Category | None:
    return db.execute(select(Category).where(Category.name == name)).scalar_one_or_none()


def list_all(db: Session) -> list[Category]:
    return list(db.execute(select(Category)).scalars())


def create(db: Session, category: Category) -> Category:
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def save(db: Session, category: Category) -> Category:
    db.commit()
    db.refresh(category)
    return category


def delete(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()
