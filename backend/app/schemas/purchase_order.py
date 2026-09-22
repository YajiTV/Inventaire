from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ReadModel
from app.schemas.enums import OrderStatus
from app.schemas.order_line import OrderLineCreate, OrderLineRead


class PurchaseOrderBase(BaseModel):
    reference: str = Field(min_length=1, max_length=40, pattern=r"^[A-Z0-9-]+$")
    supplier_id: int
    location_id: int


class PurchaseOrderCreate(PurchaseOrderBase):
    lines: list[OrderLineCreate] = Field(min_length=1)


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
