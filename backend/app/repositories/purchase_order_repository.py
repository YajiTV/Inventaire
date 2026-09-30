from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder
from app.schemas.enums import OrderStatus


def get_by_id(db: Session, order_id: int) -> PurchaseOrder | None:
    return db.get(PurchaseOrder, order_id)


def get_by_reference(db: Session, reference: str) -> PurchaseOrder | None:
    stmt = select(PurchaseOrder).where(PurchaseOrder.reference == reference)
    return db.execute(stmt).scalar_one_or_none()


def list_all(
    db: Session,
    supplier_id: int | None = None,
    order_status: OrderStatus | None = None,
) -> list[PurchaseOrder]:
    stmt = select(PurchaseOrder)
    if supplier_id is not None:
        stmt = stmt.where(PurchaseOrder.supplier_id == supplier_id)
    if order_status is not None:
        stmt = stmt.where(PurchaseOrder.status == order_status)
    stmt = stmt.order_by(PurchaseOrder.ordered_at.desc())
    return list(db.execute(stmt).scalars().all())


def create(db: Session, order: PurchaseOrder) -> PurchaseOrder:
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def save(db: Session, order: PurchaseOrder) -> PurchaseOrder:
    db.commit()
    db.refresh(order)
    return order


def delete(db: Session, order: PurchaseOrder) -> None:
    db.delete(order)
    db.commit()
