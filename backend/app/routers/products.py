from fastapi import APIRouter, Query, status

from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse, Page
from app.schemas.product import ProductCreate, ProductLookup, ProductRead, ProductUpdate

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


@router.get("", response_model=Page[ProductRead])
def list_products(
    q: str | None = Query(default=None, max_length=150),
    category_id: int | None = None,
    supplier_id: int | None = None,
    below_threshold: bool = False,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> Page[ProductRead]:
    not_implemented()


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate) -> ProductRead:
    not_implemented()


@router.get("/lookup/{barcode}", response_model=ProductLookup, responses={502: {"model": ErrorResponse}})
def lookup_product(barcode: str) -> ProductLookup:
    """Fetches product data from Open Food Facts to prefill the creation form."""
    not_implemented()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int) -> ProductRead:
    not_implemented()


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate) -> ProductRead:
    not_implemented()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int) -> None:
    not_implemented()
