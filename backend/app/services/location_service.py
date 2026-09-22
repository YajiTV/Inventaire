from sqlalchemy.orm import Session

from app.models.location import Location
from app.models.stock import Stock
from app.repositories import location_repository, stock_repository
from app.schemas.location import LocationCreate, LocationUpdate


class LocationNotFoundError(Exception):
    pass


class LocationCodeAlreadyExistsError(Exception):
    pass


class LocationHasStockError(Exception):
    pass


def list_locations(db: Session) -> list[Location]:
    return location_repository.list_all(db)


def get_location(db: Session, location_id: int) -> Location:
    location = location_repository.get_by_id(db, location_id)
    if location is None:
        raise LocationNotFoundError(location_id)
    return location


def create_location(db: Session, payload: LocationCreate) -> Location:
    if location_repository.get_by_code(db, payload.code) is not None:
        raise LocationCodeAlreadyExistsError(payload.code)
    location = Location(code=payload.code, name=payload.name, description=payload.description)
    return location_repository.create(db, location)


def update_location(db: Session, location_id: int, payload: LocationUpdate) -> Location:
    location = get_location(db, location_id)
    if payload.code is not None and payload.code != location.code:
        if location_repository.get_by_code(db, payload.code) is not None:
            raise LocationCodeAlreadyExistsError(payload.code)
        location.code = payload.code
    if payload.name is not None:
        location.name = payload.name
    if payload.description is not None:
        location.description = payload.description
    return location_repository.save(db, location)


def delete_location(db: Session, location_id: int) -> None:
    location = get_location(db, location_id)
    if stock_repository.exists_for_location(db, location_id):
        raise LocationHasStockError(location_id)
    location_repository.delete(db, location)


def list_location_stocks(db: Session, location_id: int) -> list[Stock]:
    get_location(db, location_id)
    return stock_repository.list_by_location(db, location_id)
