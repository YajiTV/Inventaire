from pydantic import BaseModel, ConfigDict


class ReadModel(BaseModel):
    """Base for schemas built from ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class Page[T](BaseModel):
    """Paginated list returned by collection endpoints that support filters."""

    items: list[T]
    total: int
    limit: int
    offset: int


class ErrorResponse(BaseModel):
    """Body returned by HTTPException, documented so the front can rely on it."""

    detail: str
