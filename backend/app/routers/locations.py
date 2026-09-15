from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse
from app.schemas.location import LocationCreate, LocationRead, LocationUpdate

router = APIRouter(
    prefix="/locations",
    tags=["Locations"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=list[LocationRead])
def list_locations() -> list[LocationRead]:
    not_implemented()


@router.post("", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def create_location(payload: LocationCreate) -> LocationRead:
    not_implemented()


@router.get("/{location_id}", response_model=LocationRead)
def get_location(location_id: int) -> LocationRead:
    not_implemented()


@router.patch("/{location_id}", response_model=LocationRead)
def update_location(location_id: int, payload: LocationUpdate) -> LocationRead:
    not_implemented()


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int) -> None:
    not_implemented()
