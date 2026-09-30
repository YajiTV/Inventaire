from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


def get_by_id(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def list_all(db: Session) -> list[Supplier]:
    stmt = select(Supplier)
    result = db.execute(stmt)
    return list(result.scalars().all())


def create(db: Session, supplier: Supplier) -> Supplier:
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def save(db: Session, supplier: Supplier) -> Supplier:
    db.commit()
    db.refresh(supplier)
    return supplier


def delete(db: Session, supplier: Supplier) -> None:
    db.delete(supplier)
    db.commit()
