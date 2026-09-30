from sqlalchemy.orm import Session

from app.clients import openfoodfacts
from app.models.product import Product
from app.repositories import category_repository, product_repository, supplier_repository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductNotFoundError(Exception):
    pass


class ProductSkuAlreadyExistsError(Exception):
    pass


class UnknownCategoryError(Exception):
    pass


class UnknownSupplierError(Exception):
    pass


def check_relations(db: Session, category_id: int | None, supplier_id: int | None) -> None:
    if category_id is not None and category_repository.get_by_id(db, category_id) is None:
        raise UnknownCategoryError(category_id)
    if supplier_id is not None and supplier_repository.get_by_id(db, supplier_id) is None:
        raise UnknownSupplierError(supplier_id)


def add_total_quantity(db: Session, product: Product) -> Product:
    product.total_quantity = product_repository.get_total_quantity(db, product.id)
    return product


def fill_from_openfoodfacts(product: Product) -> None:
    if product.barcode is None:
        return
    if product.image_url is not None and product.description is not None:
        return
    try:
        info = openfoodfacts.fetch_product(product.barcode)
    # Best effort: the product is still created without the extra data.
    except openfoodfacts.OpenFoodFactsError:
        return
    if product.image_url is None:
        product.image_url = info["image_url"]
    if product.description is None:
        product.description = info["description"]


def list_products(
    db: Session,
    q: str | None,
    category_id: int | None,
    supplier_id: int | None,
    below_threshold: bool,
    limit: int,
    offset: int,
) -> dict:
    products = product_repository.list_filtered(db, q, category_id, supplier_id)

    for product in products:
        add_total_quantity(db, product)

    # total_quantity comes from another table, so this filter runs in Python, before paginating.
    if below_threshold:
        below = []
        for product in products:
            if product.total_quantity <= product.reorder_threshold:
                below.append(product)
        products = below

    total = len(products)
    page_items = products[offset:offset + limit]
    return {"items": page_items, "total": total, "limit": limit, "offset": offset}


def get_product(db: Session, product_id: int) -> Product:
    product = product_repository.get_by_id(db, product_id)
    if product is None:
        raise ProductNotFoundError(product_id)
    return add_total_quantity(db, product)


def create_product(db: Session, payload: ProductCreate) -> Product:
    if product_repository.get_by_sku(db, payload.sku) is not None:
        raise ProductSkuAlreadyExistsError(payload.sku)
    check_relations(db, payload.category_id, payload.supplier_id)
    product = Product(
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        barcode=payload.barcode,
        image_url=payload.image_url,
        unit_price=payload.unit_price,
        reorder_threshold=payload.reorder_threshold,
        category_id=payload.category_id,
        supplier_id=payload.supplier_id,
    )
    fill_from_openfoodfacts(product)
    return product_repository.create(db, product)


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    check_relations(db, payload.category_id, payload.supplier_id)
    if payload.name is not None:
        product.name = payload.name
    if payload.description is not None:
        product.description = payload.description
    if payload.barcode is not None:
        product.barcode = payload.barcode
    if payload.image_url is not None:
        product.image_url = payload.image_url
    if payload.unit_price is not None:
        product.unit_price = payload.unit_price
    if payload.reorder_threshold is not None:
        product.reorder_threshold = payload.reorder_threshold
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.supplier_id is not None:
        product.supplier_id = payload.supplier_id
    product_repository.save(db, product)
    return add_total_quantity(db, product)


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    product_repository.delete(db, product)


def lookup_product(barcode: str) -> dict:
    return openfoodfacts.fetch_product(barcode)
