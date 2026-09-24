from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


# Repository = la seule couche qui parle directement à la base (via la session SQLAlchemy)


# Récupère un fournisseur par son id (None s'il n'existe pas)
def get_by_id(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


# Récupère tous les fournisseurs
def list_all(db: Session) -> list[Supplier]:
    stmt = select(Supplier)
    result = db.execute(stmt)
    return list(result.scalars().all())


# Insère un nouveau fournisseur en base
def create(db: Session, supplier: Supplier) -> Supplier:
    db.add(supplier)
    db.commit()
    # refresh récupère l'id auto-incrémenté généré par Postgres
    db.refresh(supplier)
    return supplier


# Valide les modifications faites sur l'objet (la modif se fait directement sur l'objet Python)
def save(db: Session, supplier: Supplier) -> Supplier:
    db.commit()
    db.refresh(supplier)
    return supplier


# Supprime un fournisseur
def delete(db: Session, supplier: Supplier) -> None:
    db.delete(supplier)
    db.commit()
