from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder
from app.schemas.enums import OrderStatus


# Repository = the only layer talking to the database through the session.


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
    # Both filters are optional query parameters, so each one is applied only
    # when the client sent it.
    if supplier_id is not None:
        stmt = stmt.where(PurchaseOrder.supplier_id == supplier_id)
    if order_status is not None:
        stmt = stmt.where(PurchaseOrder.status == order_status)
    stmt = stmt.order_by(PurchaseOrder.ordered_at.desc())
    return list(db.execute(stmt).scalars().all())


def create(db: Session, order: PurchaseOrder) -> PurchaseOrder:
    # The lines are cascaded with the order, so a single commit writes the
    # whole aggregate or nothing at all.
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
