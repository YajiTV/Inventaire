from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.clients import openfoodfacts
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.common import ErrorResponse, Page
from app.schemas.product import ProductCreate, ProductLookup, ProductRead, ProductUpdate
from app.services import product_service

# Documentation Swagger : chaque route a un "summary" (titre dans Swagger), un docstring (description
# détaillée), une "response_description" (la réponse en cas de succès) et ses codes d'erreur possibles.
# Tout est écrit en anglais, comme le reste de la doc de l'équipe.

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token (write routes only, reads are public)"},
        404: {"model": ErrorResponse, "description": "Resource not found"},
        422: {"description": "Invalid body or query parameter, rejected by Pydantic"},
    },
)

PRODUCT_NOT_FOUND = "Produit introuvable"
CATEGORY_NOT_FOUND = "Categorie introuvable"
SUPPLIER_NOT_FOUND = "Fournisseur introuvable"


# GET /products -> liste filtrée et paginée au format Page (items, total, limit, offset)
@router.get(
    "",
    response_model=Page[ProductRead],
    summary="List the products",
    response_description="One page of products, with the total number of matches",
    responses={404: {"description": "Not returned by this route"}},
)
def list_products(
    q: str | None = Query(
        default=None, max_length=150, description="Case-insensitive search in the name, the SKU or the barcode"
    ),
    category_id: int | None = Query(default=None, description="Keep only the products of this category"),
    supplier_id: int | None = Query(default=None, description="Keep only the products of this supplier"),
    below_threshold: bool = Query(
        default=False, description="Keep only the products whose total quantity is at or below their reorder threshold"
    ),
    limit: int = Query(default=20, ge=1, le=100, description="How many products to return (page size)"),
    offset: int = Query(default=0, ge=0, description="How many matching products to skip"),
    db: Session = Depends(get_db),
):
    """
    Returns the products, sorted by id, one page at a time.

    Every filter is optional and they combine with each other (AND).
    `total` is the number of matching products before pagination, so the front
    can compute the number of pages. Each product carries its `total_quantity`,
    the sum of its stock over every location.
    """
    return product_service.list_products(db, q, category_id, supplier_id, below_threshold, limit, offset)


# POST /products -> création (201), 409 si le SKU existe déjà,
# 404 si la catégorie ou le fournisseur n'existe pas, 422 si le body est invalide
@router.post(
    "",
    dependencies=[Depends(get_current_user)],
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
    response_description="The created product",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown category or supplier"},
        409: {"model": ErrorResponse, "description": "A product already uses this SKU"},
    },
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """
    Creates a product.

    When a `barcode` is given but no `description` or `image_url`, the API fills
    them from Open Food Facts and stores them. If Open Food Facts is down or does
    not know the barcode, the product is still created, without those fields.
    """
    try:
        return product_service.create_product(db, payload)
    except product_service.ProductSkuAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un produit porte deja ce SKU") from exc
    except product_service.UnknownCategoryError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CATEGORY_NOT_FOUND) from exc
    except product_service.UnknownSupplierError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc


# GET /products/lookup/{barcode} -> infos Open Food Facts pour préremplir le formulaire (200),
# 404 si le code-barres est inconnu, 502 si Open Food Facts est en panne, 504 s'il est trop lent
@router.get(
    "/lookup/{barcode}",
    dependencies=[Depends(get_current_user)],
    response_model=ProductLookup,
    summary="Look up a barcode on Open Food Facts",
    response_description="The product data found on Open Food Facts",
    responses={
        404: {"model": ErrorResponse, "description": "Open Food Facts does not know this barcode"},
        502: {"model": ErrorResponse, "description": "Open Food Facts is unreachable or answered an unusable response"},
        504: {"model": ErrorResponse, "description": "Open Food Facts did not answer within 5 seconds"},
    },
)
def lookup_product(barcode: str):
    """
    Fetches product data from Open Food Facts to prefill the creation form.

    Nothing is stored: this route only reads. Fields that Open Food Facts
    does not provide come back as `null`.
    """
    try:
        return product_service.lookup_product(barcode)
    except openfoodfacts.OpenFoodFactsProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Code-barres inconnu sur Open Food Facts") from exc
    except openfoodfacts.OpenFoodFactsTimeoutError as exc:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Open Food Facts ne repond pas") from exc
    except openfoodfacts.OpenFoodFactsUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Open Food Facts est indisponible") from exc


# GET /products/{id} -> un produit (200) ou 404
@router.get(
    "/{product_id}",
    response_model=ProductRead,
    summary="Get a product",
    response_description="The product, with its total quantity in stock",
    responses={404: {"model": ErrorResponse, "description": "Unknown product"}},
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Returns one product by its id."""
    try:
        return product_service.get_product(db, product_id)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc


# PATCH /products/{id} -> modification partielle (200),
# 404 si le produit, la catégorie ou le fournisseur n'existe pas
@router.patch(
    "/{product_id}",
    dependencies=[Depends(get_current_user)],
    response_model=ProductRead,
    summary="Update a product",
    response_description="The updated product",
    responses={404: {"model": ErrorResponse, "description": "Unknown product, category or supplier"}},
)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    """
    Partially updates a product: only the fields sent in the body are changed.

    The SKU cannot be changed.
    """
    try:
        return product_service.update_product(db, product_id, payload)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc
    except product_service.UnknownCategoryError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CATEGORY_NOT_FOUND) from exc
    except product_service.UnknownSupplierError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPPLIER_NOT_FOUND) from exc


# DELETE /products/{id} -> suppression (204, pas de body) ou 404
@router.delete(
    "/{product_id}",
    dependencies=[Depends(get_current_user)],
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    response_description="The product was deleted, no body",
    responses={
        404: {"model": ErrorResponse, "description": "Unknown product"},
        409: {"model": ErrorResponse, "description": "The product still has stock movements or order lines"},
    },
)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    """Deletes a product by its id."""
    try:
        product_service.delete_product(db, product_id)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCT_NOT_FOUND) from exc
