from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ReadModel


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=40, pattern=r"^[A-Z0-9-]+$", examples=["PATE-001"])
    name: str = Field(min_length=1, max_length=150, examples=["Pate a tartiner 400 g"])
    description: str | None = Field(default=None, max_length=1000, examples=["Pate a tartiner aux noisettes"])
    barcode: str | None = Field(default=None, min_length=8, max_length=14, pattern=r"^\d+$", examples=["3017620422003"])
    image_url: str | None = Field(default=None, max_length=500, examples=["https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.jpg"])
    unit_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2, examples=["4.50"])
    reorder_threshold: int = Field(default=0, ge=0, examples=[10])
    category_id: int = Field(examples=[1])
    supplier_id: int | None = Field(default=None, examples=[1])


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150, examples=["Pate a tartiner 750 g"])
    description: str | None = Field(default=None, max_length=1000)
    barcode: str | None = Field(default=None, min_length=8, max_length=14, pattern=r"^\d+$")
    image_url: str | None = Field(default=None, max_length=500)
    unit_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2, examples=["6.90"])
    reorder_threshold: int | None = Field(default=None, ge=0)
    category_id: int | None = None
    supplier_id: int | None = None


class ProductRead(ReadModel, ProductBase):
    id: int = Field(examples=[1])
    total_quantity: int = Field(default=0, examples=[42])


class ProductLookup(BaseModel):
    """Product data fetched from Open Food Facts for a barcode."""

    barcode: str = Field(examples=["3017620422003"])
    name: str | None = Field(default=None, examples=["Nutella"])
    description: str | None = Field(default=None, examples=["Pate a tartiner aux noisettes et au cacao"])
    image_url: str | None = Field(default=None, examples=["https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.jpg"])
