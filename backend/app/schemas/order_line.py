from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class OrderLineBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)


class OrderLineCreate(OrderLineBase):
    pass


class OrderLineUpdate(BaseModel):
    quantity: int | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)


class OrderLineRead(ReadModel, OrderLineBase):
    id: int
    order_id: int
