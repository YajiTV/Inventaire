from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.repositories import supplier_repository
from app.schemas.supplier import SupplierCreate, SupplierUpdate


# Erreur métier levée quand l'id demandé n'existe pas en base.
# Le router la transformera en HTTPException 404.
class SupplierNotFoundError(Exception):
    pass


# Liste de tous les fournisseurs
def list_suppliers(db: Session) -> list[Supplier]:
    return supplier_repository.list_all(db)


# Un fournisseur par son id, erreur s'il n'existe pas
def get_supplier(db: Session, supplier_id: int) -> Supplier:
    supplier = supplier_repository.get_by_id(db, supplier_id)
    if supplier is None:
        raise SupplierNotFoundError(supplier_id)
    return supplier


# Création : on transforme le schéma Pydantic (payload) en objet SQLAlchemy (Supplier)
def create_supplier(db: Session, payload: SupplierCreate) -> Supplier:
    supplier = Supplier(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
    )
    return supplier_repository.create(db, supplier)


# Modification partielle (PATCH) : on ne change que les champs envoyés
def update_supplier(db: Session, supplier_id: int, payload: SupplierUpdate) -> Supplier:
    supplier = get_supplier(db, supplier_id)
    if payload.name is not None:
        supplier.name = payload.name
    if payload.email is not None:
        supplier.email = payload.email
    if payload.phone is not None:
        supplier.phone = payload.phone
    if payload.address is not None:
        supplier.address = payload.address
    return supplier_repository.save(db, supplier)


# Suppression (get_supplier lève déjà l'erreur si l'id n'existe pas)
def delete_supplier(db: Session, supplier_id: int) -> None:
    supplier = get_supplier(db, supplier_id)
    supplier_repository.delete(db, supplier)
