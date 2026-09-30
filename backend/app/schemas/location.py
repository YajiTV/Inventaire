from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class LocationBase(BaseModel):
    code: str = Field(min_length=1, max_length=20, pattern=r"^[A-Z0-9-]+$")
    name: str = Field(min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20, pattern=r"^[A-Z0-9-]+$")
    name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class LocationRead(ReadModel, LocationBase):
    id: int


class AddressLookup(BaseModel):
    """Address data fetched from the French government address API (BAN) for a free-text query."""

    label: str | None = Field(default=None, examples=["8 Boulevard du Port 80000 Amiens"])
    city: str | None = Field(default=None, examples=["Amiens"])
    postcode: str | None = Field(default=None, examples=["80000"])
    latitude: float | None = Field(default=None, examples=[49.897452])
    longitude: float | None = Field(default=None, examples=[2.298047])
