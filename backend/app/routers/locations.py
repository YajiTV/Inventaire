from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.clients import adresse
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.common import ErrorResponse
from app.schemas.location import AddressLookup, LocationCreate, LocationRead, LocationUpdate
from app.schemas.stock import StockRead
from app.services import location_service

router = APIRouter(
    prefix="/locations",
    tags=["Locations"],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token (write routes only, reads are public)"},
        404: {"model": ErrorResponse, "description": "Unknown location"},
        422: {"description": "Invalid body or query parameter, rejected by Pydantic"},
    },
)

LOCATION_NOT_FOUND = "Emplacement introuvable"
LOCATION_CODE_TAKEN = "Un emplacement porte deja ce code"


@router.get(
    "",
    response_model=list[LocationRead],
    summary="List the locations",
    response_description="Every storage location",
    responses={404: {"description": "Not returned by this route"}},
)
def list_locations(db: Session = Depends(get_db)) -> list[LocationRead]:
    """Returns every storage location (warehouse, aisle, shelf...)."""
    return location_service.list_locations(db)


@router.post(
    "",
    dependencies=[Depends(get_current_user)],
    response_model=LocationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a location",
    response_description="The created location",
    responses={409: {"model": ErrorResponse, "description": "A location already uses this code"}},
)
def create_location(payload: LocationCreate, db: Session = Depends(get_db)) -> LocationRead:
    """Creates a location. The code is unique, in capitals, digits and dashes (`A1`, `ZONE-B`)."""
    try:
        return location_service.create_location(db, payload)
    except location_service.LocationCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=LOCATION_CODE_TAKEN) from exc


# GET /locations/geocode -> interroge l'API Adresse (BAN, data.gouv.fr) sur une recherche libre,
# ne stocke rien : sert a preremplir/valider une adresse avant de creer un emplacement.
# Route statique : doit rester avant /{location_id} sinon FastAPI essaie de convertir "geocode" en int.
@router.get(
    "/geocode",
    dependencies=[Depends(get_current_user)],
    response_model=AddressLookup,
    summary="Look up an address on the national address API",
    response_description="The best matching address",
    responses={
        404: {"model": ErrorResponse, "description": "No address matches this query"},
        502: {"model": ErrorResponse, "description": "The address API is unreachable or answered an unusable response"},
        504: {"model": ErrorResponse, "description": "The address API did not answer within 5 seconds"},
    },
)
def geocode_address(q: str = Query(description="Free text address search")) -> AddressLookup:
    """Finds an address with the Base Adresse Nationale. Nothing is stored."""
    try:
        return location_service.lookup_address(q)
    except adresse.AdresseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune adresse ne correspond a cette recherche") from exc
    except adresse.AdresseTimeoutError as exc:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="L'API adresse ne repond pas") from exc
    except adresse.AdresseUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="L'API adresse est indisponible") from exc


@router.get(
    "/{location_id}",
    response_model=LocationRead,
    summary="Get a location",
    response_description="The location",
)
def get_location(location_id: int, db: Session = Depends(get_db)) -> LocationRead:
    """Returns one location by its id."""
    try:
        return location_service.get_location(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc


@router.patch(
    "/{location_id}",
    dependencies=[Depends(get_current_user)],
    response_model=LocationRead,
    summary="Update a location",
    response_description="The updated location",
    responses={409: {"model": ErrorResponse, "description": "A location already uses this code"}},
)
def update_location(location_id: int, payload: LocationUpdate, db: Session = Depends(get_db)) -> LocationRead:
    """Partially updates a location: only the fields sent in the body are changed."""
    try:
        return location_service.update_location(db, location_id, payload)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except location_service.LocationCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=LOCATION_CODE_TAKEN) from exc


@router.delete(
    "/{location_id}",
    dependencies=[Depends(get_current_user)],
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a location",
    response_description="The location was deleted, no body",
    responses={409: {"model": ErrorResponse, "description": "The location still holds stock, orders or movements"}},
)
def delete_location(location_id: int, db: Session = Depends(get_db)) -> None:
    """Deletes a location. Refused while it still holds stock."""
    try:
        location_service.delete_location(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
    except location_service.LocationHasStockError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer un emplacement qui contient du stock",
        ) from exc


@router.get(
    "/{location_id}/stocks",
    response_model=list[StockRead],
    summary="List the stock of a location",
    response_description="Every stock line held at this location",
)
def list_location_stocks(location_id: int, db: Session = Depends(get_db)) -> list[StockRead]:
    """Returns the quantity of each product held at this location."""
    try:
        return location_service.list_location_stocks(db, location_id)
    except location_service.LocationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=LOCATION_NOT_FOUND) from exc
