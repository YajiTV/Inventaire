from datetime import datetime
from typing import Self

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import ReadModel
from app.schemas.enums import MovementType


class StockMovementCreate(BaseModel):
    """
    Business rules, also enforced server side:
    - "in" requires a target location
    - "out" requires a source location
    - "transfer" requires both, and they must differ
    """

    product_id: int
    type: MovementType
    quantity: int = Field(gt=0)
    source_location_id: int | None = None
    target_location_id: int | None = None
    reason: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def check_locations(self) -> Self:
        if self.type is MovementType.IN and self.target_location_id is None:
            raise ValueError("target_location_id is required for an incoming movement")
        if self.type is MovementType.OUT and self.source_location_id is None:
            raise ValueError("source_location_id is required for an outgoing movement")
        if self.type is MovementType.TRANSFER:
            if self.source_location_id is None or self.target_location_id is None:
                raise ValueError("a transfer requires both a source and a target location")
            if self.source_location_id == self.target_location_id:
                raise ValueError("a transfer requires two different locations")
        return self


class StockMovementRead(ReadModel):
    id: int
    product_id: int
    type: MovementType
    quantity: int
    source_location_id: int | None
    target_location_id: int | None
    reason: str | None
    user_id: int
    created_at: datetime
