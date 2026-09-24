from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


# Repository = la seule couche qui parle directement à la base (via la session SQLAlchemy)


# Récupère un produit par son id (None s'il n'existe pas)
def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


# Récupère un produit par son SKU (None s'il n'existe pas), sert à vérifier l'unicité
def get_by_sku(db: Session, sku: str) -> Product | None:
    stmt = select(Product).where(Product.sku == sku)
    result = db.execute(stmt)
    return result.scalars().first()


# Récupère tous les produits
def list_all(db: Session) -> list[Product]:
    stmt = select(Product)
    result = db.execute(stmt)
    return list(result.scalars().all())


# Insère un nouveau produit en base
def create(db: Session, product: Product) -> Product:
    db.add(product)
    db.commit()
    # refresh récupère l'id auto-incrémenté généré par Postgres
    db.refresh(product)
    return product


# Valide les modifications faites sur l'objet
def save(db: Session, product: Product) -> Product:
    db.commit()
    db.refresh(product)
    return product


# Supprime un produit
def delete(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
