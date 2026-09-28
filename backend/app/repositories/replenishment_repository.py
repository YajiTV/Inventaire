from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock import Stock


# Repository = the only layer talking to the database through the session.


def list_below_threshold(db: Session, supplier_id: int | None = None) -> list[tuple[Product, int]]:
    """Products whose total quantity, summed over every location, is under their threshold.

    A product with no stock row at all counts as a quantity of 0, hence the
    outer join and the coalesce. A threshold of 0 never matches: nothing is
    below 0, so a product without a threshold is never suggested.
    """
    total = func.coalesce(func.sum(Stock.quantity), 0)
    stmt = (
        select(Product, total)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .group_by(Product.id)
        .having(total < Product.reorder_threshold)
        .order_by(Product.id)
    )
    if supplier_id is not None:
        stmt = stmt.where(Product.supplier_id == supplier_id)
    return [(product, int(quantity)) for product, quantity in db.execute(stmt).all()]