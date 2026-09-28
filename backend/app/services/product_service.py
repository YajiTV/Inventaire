from sqlalchemy.orm import Session

from app.clients import openfoodfacts
from app.models.product import Product
from app.repositories import category_repository, product_repository, supplier_repository
from app.schemas.product import ProductCreate, ProductUpdate


# Erreur métier : l'id demandé n'existe pas (le router la transformera en 404)
class ProductNotFoundError(Exception):
    pass


# Erreur métier : un produit avec ce SKU existe déjà (le router la transformera en 409)
class ProductSkuAlreadyExistsError(Exception):
    pass


# Erreur métier : la catégorie envoyée n'existe pas (le router la transformera en 404)
class UnknownCategoryError(Exception):
    pass


# Erreur métier : le fournisseur envoyé n'existe pas (le router la transformera en 404)
class UnknownSupplierError(Exception):
    pass


# Vérifie que la catégorie et le fournisseur existent avant d'écrire en base.
# None = champ non envoyé (PATCH) ou pas de fournisseur : rien à vérifier.
def check_relations(db: Session, category_id: int | None, supplier_id: int | None) -> None:
    if category_id is not None and category_repository.get_by_id(db, category_id) is None:
        raise UnknownCategoryError(category_id)
    if supplier_id is not None and supplier_repository.get_by_id(db, supplier_id) is None:
        raise UnknownSupplierError(supplier_id)


# total_quantity n'est pas une colonne de la table products : on la calcule à partir
# de la table stocks, puis on l'accroche à l'objet pour que ProductRead puisse la lire
def add_total_quantity(db: Session, product: Product) -> Product:
    product.total_quantity = product_repository.get_total_quantity(db, product.id)
    return product


# Liste filtrée et paginée : renvoie un dictionnaire au format Page (items, total, limit, offset)
def list_products(
    db: Session,
    q: str | None,
    category_id: int | None,
    supplier_id: int | None,
    below_threshold: bool,
    limit: int,
    offset: int,
) -> dict:
    # 1. Les filtres sur les colonnes sont faits en SQL par le repository
    products = product_repository.list_filtered(db, q, category_id, supplier_id)

    # 2. On calcule le stock total de chaque produit
    for product in products:
        add_total_quantity(db, product)

    # 3. Le filtre "sous le seuil" se fait en Python, car total_quantity vient d'une autre table
    if below_threshold:
        below = []
        for product in products:
            if product.total_quantity <= product.reorder_threshold:
                below.append(product)
        products = below

    # 4. Pagination : total = nombre de résultats AVANT de découper,
    #    puis on garde seulement la tranche [offset, offset + limit]
    total = len(products)
    page_items = products[offset:offset + limit]
    return {"items": page_items, "total": total, "limit": limit, "offset": offset}


# Un produit par son id (avec son stock total), erreur s'il n'existe pas
def get_product(db: Session, product_id: int) -> Product:
    product = product_repository.get_by_id(db, product_id)
    if product is None:
        raise ProductNotFoundError(product_id)
    return add_total_quantity(db, product)


# Création : on refuse un SKU déjà utilisé, une catégorie ou un fournisseur inexistant,
# puis on transforme le payload en objet Product
def create_product(db: Session, payload: ProductCreate) -> Product:
    if product_repository.get_by_sku(db, payload.sku) is not None:
        raise ProductSkuAlreadyExistsError(payload.sku)
    check_relations(db, payload.category_id, payload.supplier_id)
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
    check_relations(db, payload.category_id, payload.supplier_id)
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
    product_repository.save(db, product)
    return add_total_quantity(db, product)


# Suppression (get_product lève déjà l'erreur si l'id n'existe pas)
def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    product_repository.delete(db, product)


# Préremplissage : infos d'un produit sur Open Food Facts à partir de son code-barres.
# Le service passe par le client (comme il passe par le repository pour la base) ;
# les erreurs OpenFoodFacts...Error remontent telles quelles jusqu'au router.
def lookup_product(barcode: str) -> dict:
    return openfoodfacts.fetch_product(barcode)
