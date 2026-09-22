from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class StockBase(BaseModel):
    product_id: int
    location_id: int
    quantity: int = Field(ge=0)


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    quantity: int | None = Field(default=None, ge=0)


class StockRead(ReadModel, StockBase):
    id: int
