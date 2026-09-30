from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock import Stock


# Repository = la seule couche qui parle directement à la base (via la session SQLAlchemy)


# Récupère un produit par son id (None s'il n'existe pas)
def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


# Récupère un produit par son SKU (None s'il n'existe pas), sert à vérifier l'unicité
def get_by_sku(db: Session, sku: str) -> Product | None:
    stmt = select(Product).where(Product.sku == sku)
    result = db.execute(stmt)
    return result.scalars().first()


# Récupère les produits qui correspondent aux filtres.
# Chaque filtre à None est ignoré : on n'ajoute le .where() que s'il est rempli.
def list_filtered(db: Session, q: str | None, category_id: int | None, supplier_id: int | None) -> list[Product]:
    stmt = select(Product)
    if q is not None:
        # ilike = "contient", sans tenir compte des majuscules ; "%" = n'importe quels caractères
        # or_ = il suffit qu'UN des trois champs corresponde
        search = f"%{q}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(search),
                Product.sku.ilike(search),
                Product.barcode.ilike(search),
            )
        )
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if supplier_id is not None:
        stmt = stmt.where(Product.supplier_id == supplier_id)
    # Tri par id : la pagination renvoie toujours les produits dans le même ordre
    stmt = stmt.order_by(Product.id)
    result = db.execute(stmt)
    return list(result.scalars().all())


# Quantité totale d'un produit = somme de ses stocks dans tous les emplacements
def get_total_quantity(db: Session, product_id: int) -> int:
    stmt = select(Stock).where(Stock.product_id == product_id)
    result = db.execute(stmt)
    total = 0
    for stock in result.scalars().all():
        total = total + stock.quantity
    return total


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
