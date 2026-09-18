from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.location import LocationCreate, LocationRead, LocationUpdate
from app.schemas.stock import StockRead
from app.services import location_service

router = APIRouter(
    prefix="/locations",
    tags=["Locations"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[LocationRead])
def list_locations(db: Session = Depends(get_db)) -> list[LocationRead]:
    return location_service.list_locations(db)


@router.post("", response_model=LocationRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_location(payload: LocationCreate, db: Session = Depends(get_db)) -> LocationRead:
    try:
        return location_service.create_location(db, payload)
    except location_service.LocationCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un emplacement porte deja ce code") from exc


@router.get("/{location_id}", response_model=LocationRead)
def get_location(location_id: int, db: Session = Depends(get_db)) -> LocationRead:
    try:
        return location_service.get_location(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emplacement introuvable") from exc


@router.patch("/{location_id}", response_model=LocationRead, responses={409: {"model": ErrorResponse}})
def update_location(location_id: int, payload: LocationUpdate, db: Session = Depends(get_db)) -> LocationRead:
    try:
        return location_service.update_location(db, location_id, payload)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emplacement introuvable") from exc
    except location_service.LocationCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un emplacement porte deja ce code") from exc


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT, responses={409: {"model": ErrorResponse}})
def delete_location(location_id: int, db: Session = Depends(get_db)) -> None:
    try:
        location_service.delete_location(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emplacement introuvable") from exc
    except location_service.LocationHasStockError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer un emplacement qui contient du stock",
        ) from exc


@router.get("/{location_id}/stocks", response_model=list[StockRead])
def list_location_stocks(location_id: int, db: Session = Depends(get_db)) -> list[StockRead]:
    try:
        return location_service.list_location_stocks(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emplacement introuvable") from exc
