from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.location import Location


def get_by_id(db: Session, location_id: int) -> Location | None:
    return db.get(Location, location_id)


def get_by_code(db: Session, code: str) -> Location | None:
    return db.execute(select(Location).where(Location.code == code)).scalar_one_or_none()


def list_all(db: Session) -> list[Location]:
    return list(db.execute(select(Location)).scalars())


def create(db: Session, location: Location) -> Location:
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def save(db: Session, location: Location) -> Location:
    db.commit()
    db.refresh(location)
    return location


def delete(db: Session, location: Location) -> None:
    db.delete(location)
    db.commit()
