from datetime import datetime
from decimal import Decimal
from typing import Self

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import ReadModel
from app.schemas.enums import OrderStatus
from app.schemas.order_line import OrderLineCreate, OrderLineRead


class PurchaseOrderBase(BaseModel):
    reference: str = Field(min_length=1, max_length=40, pattern=r"^[A-Z0-9-]+$")
    supplier_id: int
    location_id: int


class PurchaseOrderCreate(PurchaseOrderBase):
    lines: list[OrderLineCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def check_distinct_products(self) -> Self:
        # Same rule as POST /purchase-orders/{id}/lines: one line per product.
        product_ids = [line.product_id for line in self.lines]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("each product can appear only once in the lines of an order")
        return self


class PurchaseOrderUpdate(BaseModel):
    status: OrderStatus | None = None
    location_id: int | None = None


class PurchaseOrderRead(ReadModel, PurchaseOrderBase):
    id: int
    status: OrderStatus
    total_price: Decimal
    ordered_at: datetime
    received_at: datetime | None
    lines: list[OrderLineRead]
