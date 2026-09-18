from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories import category_repository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryNotFoundError(Exception):
    pass


class CategoryNameAlreadyExistsError(Exception):
    pass


def list_categories(db: Session) -> list[Category]:
    return category_repository.list_all(db)


def get_category(db: Session, category_id: int) -> Category:
    category = category_repository.get_by_id(db, category_id)
    if category is None:
        raise CategoryNotFoundError(category_id)
    return category


def create_category(db: Session, payload: CategoryCreate) -> Category:
    if category_repository.get_by_name(db, payload.name) is not None:
        raise CategoryNameAlreadyExistsError(payload.name)
    category = Category(name=payload.name, description=payload.description)
    return category_repository.create(db, category)


def update_category(db: Session, category_id: int, payload: CategoryUpdate) -> Category:
    category = get_category(db, category_id)
    if payload.name is not None and payload.name != category.name:
        if category_repository.get_by_name(db, payload.name) is not None:
            raise CategoryNameAlreadyExistsError(payload.name)
        category.name = payload.name
    if payload.description is not None:
        category.description = payload.description
    return category_repository.save(db, category)


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    category_repository.delete(db, category)
