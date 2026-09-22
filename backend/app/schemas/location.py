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
