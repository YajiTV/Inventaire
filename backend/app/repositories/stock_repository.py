from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stock import Stock


def list_by_location(db: Session, location_id: int) -> list[Stock]:
    return list(db.execute(select(Stock).where(Stock.location_id == location_id)).scalars())


def exists_for_location(db: Session, location_id: int) -> bool:
    return db.execute(select(Stock.id).where(Stock.location_id == location_id).limit(1)).first() is not None
