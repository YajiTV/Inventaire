from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class ReplenishmentSuggestion(ReadModel):
    """One product below its reorder threshold, with the quantity to order."""

    product_id: int
    product_name: str
    supplier_id: int | None
    current_quantity: int
    reorder_threshold: int
    suggested_quantity: int = Field(gt=0)


class ReplenishmentRequest(BaseModel):
    """Turns the suggestions of one supplier into a purchase order."""

    supplier_id: int
    location_id: int
    product_ids: list[int] = Field(min_length=1)
