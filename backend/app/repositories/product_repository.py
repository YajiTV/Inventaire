from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock import Stock


def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_by_sku(db: Session, sku: str) -> Product | None:
    stmt = select(Product).where(Product.sku == sku)
    result = db.execute(stmt)
    return result.scalars().first()


def list_filtered(db: Session, q: str | None, category_id: int | None, supplier_id: int | None) -> list[Product]:
    stmt = select(Product)
    if q is not None:
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
    stmt = stmt.order_by(Product.id)
    result = db.execute(stmt)
    return list(result.scalars().all())


def get_total_quantity(db: Session, product_id: int) -> int:
    stmt = select(Stock).where(Stock.product_id == product_id)
    result = db.execute(stmt)
    total = 0
    for stock in result.scalars().all():
        total = total + stock.quantity
    return total


def create(db: Session, product: Product) -> Product:
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def save(db: Session, product: Product) -> Product:
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
