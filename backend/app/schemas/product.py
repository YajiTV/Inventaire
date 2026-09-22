from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=40, pattern=r"^[A-Z0-9-]+$")
    name: str = Field(min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    barcode: str | None = Field(default=None, min_length=8, max_length=14, pattern=r"^\d+$")
    unit_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    reorder_threshold: int = Field(default=0, ge=0)
    category_id: int
    supplier_id: int | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    barcode: str | None = Field(default=None, min_length=8, max_length=14, pattern=r"^\d+$")
    unit_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    reorder_threshold: int | None = Field(default=None, ge=0)
    category_id: int | None = None
    supplier_id: int | None = None


class ProductRead(ReadModel, ProductBase):
    id: int
    total_quantity: int = 0


class ProductLookup(BaseModel):
    """Product data fetched from Open Food Facts for a barcode."""

    barcode: str
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
