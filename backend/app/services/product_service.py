from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories import product_repository
from app.schemas.product import ProductCreate, ProductUpdate


# Erreur métier : l'id demandé n'existe pas (le router la transformera en 404)
class ProductNotFoundError(Exception):
    pass


# Erreur métier : un produit avec ce SKU existe déjà (le router la transformera en 409)
class ProductSkuAlreadyExistsError(Exception):
    pass


# Liste de tous les produits
def list_products(db: Session) -> list[Product]:
    return product_repository.list_all(db)


# Un produit par son id, erreur s'il n'existe pas
def get_product(db: Session, product_id: int) -> Product:
    product = product_repository.get_by_id(db, product_id)
    if product is None:
        raise ProductNotFoundError(product_id)
    return product


# Création : on refuse un SKU déjà utilisé, puis on transforme le payload en objet Product
def create_product(db: Session, payload: ProductCreate) -> Product:
    if product_repository.get_by_sku(db, payload.sku) is not None:
        raise ProductSkuAlreadyExistsError(payload.sku)
    product = Product(
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        barcode=payload.barcode,
        unit_price=payload.unit_price,
        reorder_threshold=payload.reorder_threshold,
        category_id=payload.category_id,
        supplier_id=payload.supplier_id,
    )
    return product_repository.create(db, product)


# Modification partielle (PATCH) : on ne change que les champs envoyés
# (le SKU n'est pas modifiable, il n'est pas dans ProductUpdate)
def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    if payload.name is not None:
        product.name = payload.name
    if payload.description is not None:
        product.description = payload.description
    if payload.barcode is not None:
        product.barcode = payload.barcode
    if payload.unit_price is not None:
        product.unit_price = payload.unit_price
    if payload.reorder_threshold is not None:
        product.reorder_threshold = payload.reorder_threshold
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.supplier_id is not None:
        product.supplier_id = payload.supplier_id
    return product_repository.save(db, product)


# Suppression (get_product lève déjà l'erreur si l'id n'existe pas)
def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    product_repository.delete(db, product)
