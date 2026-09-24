from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers._stub import not_implemented
from app.schemas.common import ErrorResponse, Page
from app.schemas.product import ProductCreate, ProductLookup, ProductRead, ProductUpdate
from app.services import product_service

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)


# GET /products -> liste des produits au format Page (items, total, limit, offset)
# Les query params sont déjà déclarés (contrat figé) mais les filtres et la pagination
# seront implémentés dans les tâches suivantes : pour l'instant on renvoie tout.
@router.get("", response_model=Page[ProductRead])
def list_products(
    q: str | None = Query(default=None, max_length=150),
    category_id: int | None = None,
    supplier_id: int | None = None,
    below_threshold: bool = False,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    products = product_service.list_products(db)
    return {
        "items": products,
        "total": len(products),
        "limit": limit,
        "offset": offset,
    }


# POST /products -> création (201), 409 si le SKU existe déjà, 422 si le body est invalide
@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED, responses={409: {"model": ErrorResponse}})
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    try:
        return product_service.create_product(db, payload)
    except product_service.ProductSkuAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un produit porte deja ce SKU") from exc


# GET /products/lookup/{barcode} -> Open Food Facts (tâche mise de côté pour plus tard)
@router.get("/lookup/{barcode}", response_model=ProductLookup, responses={502: {"model": ErrorResponse}})
def lookup_product(barcode: str):
    """Fetches product data from Open Food Facts to prefill the creation form."""
    not_implemented()


# GET /products/{id} -> un produit (200) ou 404
@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    try:
        return product_service.get_product(db, product_id)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable") from exc


# PATCH /products/{id} -> modification partielle (200) ou 404
@router.patch("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    try:
        return product_service.update_product(db, product_id, payload)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable") from exc


# DELETE /products/{id} -> suppression (204, pas de body) ou 404
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    try:
        product_service.delete_product(db, product_id)
    except product_service.ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable") from exc
