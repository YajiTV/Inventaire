"""
Fills the database with the demo data set (same data as the front mocks, frontend/src/api/mocks/seed.ts):
4 categories, 4 suppliers, 3 locations, 6 products, 10 stock lines, 6 stock movements and one admin account.

    .venv/bin/python -m scripts.seed

Run it on an empty database (after "alembic upgrade head"). If products already exist,
the script does nothing, so running it twice never creates duplicates.
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.location import Location
from app.models.product import Product
from app.models.stock import Stock
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.enums import MovementType, UserRole
from app.services.password import hash_password

ADMIN_EMAIL = "admin@inventaire.fr"
ADMIN_PASSWORD = "admin1234"


CATEGORIES = [
    {"name": "Pains et viandes", "description": "Pains à burger et steaks surgelés"},
    {"name": "Frites et accompagnements", "description": "Frites, potatoes et nuggets surgelés"},
    {"name": "Boissons", "description": "Sirops à fontaine, jus et boissons chaudes"},
    {"name": "Sauces et condiments", "description": "Dosettes de sauce, cornichons et oignons"},
]

SUPPLIERS = [
    {"name": "Boulangerie de l'Est", "email": "commandes@boulangerie-est.fr", "phone": "0388112233", "address": "14 rue des Fours, 67000 Strasbourg"},
    {"name": "Viandes du Charolais", "email": "contact@viandes-charolais.fr", "phone": "0385445566", "address": "7 route de Beaune, 71120 Charolles"},
    {"name": "Pommes de Terre du Nord", "email": "ventes@pdt-nord.fr", "phone": "0321778899", "address": "5 rue des Flandres, 62000 Arras"},
    {"name": "Distri Ouest", "email": "service@distri-ouest.fr", "phone": "0240660077", "address": "3 quai de Loire, 44000 Nantes"},
]

LOCATIONS = [
    {"code": "CONG-01", "name": "Congélateur", "description": "Produits surgelés conservés à -18 °C"},
    {"code": "CUIS-01", "name": "Cuisine", "description": "Zone de préparation et de cuisson"},
    {"code": "RES-01", "name": "Réserve sèche", "description": "Stock ambiant à l'arrière du restaurant"},
]

PRODUCTS = [
    {"sku": "PAIN-BIGM-001", "name": "Pain Big Mac", "description": "Pain à trois étages pour burger double", "barcode": "3270190115007", "unit_price": "0.18", "reorder_threshold": 200, "category": "Pains et viandes", "supplier": "Boulangerie de l'Est", "stocks": {"RES-01": 360, "CUIS-01": 120}},
    {"sku": "STEA-HAC-045", "name": "Steak haché 45g", "description": "Steak de bœuf surgelé, carton de 100", "barcode": "3270190115014", "unit_price": "0.42", "reorder_threshold": 300, "category": "Pains et viandes", "supplier": "Viandes du Charolais", "stocks": {"CONG-01": 90, "CUIS-01": 30}},
    {"sku": "FRIT-SUR-250", "name": "Frites surgelées 2,5kg", "description": "Frites précuites prêtes à plonger", "barcode": "3168930009641", "unit_price": "4.60", "reorder_threshold": 40, "category": "Frites et accompagnements", "supplier": "Pommes de Terre du Nord", "stocks": {"CONG-01": 72, "CUIS-01": 24}},
    {"sku": "NUGG-POU-060", "name": "Nuggets de poulet x60", "description": "Nuggets panés surgelés, sachet de 60", "barcode": "3274080005003", "unit_price": "9.80", "reorder_threshold": 60, "category": "Frites et accompagnements", "supplier": "Viandes du Charolais", "stocks": {"CONG-01": 150}},
    {"sku": "SIRO-COL-010", "name": "Sirop cola 10L", "description": "Poche de sirop pour la fontaine à boissons", "barcode": "3123340008264", "unit_price": "28.50", "reorder_threshold": 12, "category": "Boissons", "supplier": "Distri Ouest", "stocks": {"RES-01": 5}},
    {"sku": "SAUC-KET-DOS", "name": "Dosette de ketchup", "description": "Dosette individuelle de 10g", "barcode": "3270190115021", "unit_price": "0.05", "reorder_threshold": 500, "category": "Sauces et condiments", "supplier": "Distri Ouest", "stocks": {"RES-01": 900, "CUIS-01": 300}},
]

MOVEMENTS = [
    {"sku": "PAIN-BIGM-001", "type": MovementType.IN, "quantity": 480, "source": None, "target": "RES-01", "reason": "Livraison Boulangerie de l'Est", "created_at": "2026-09-15T05:30:00+00:00"},
    {"sku": "PAIN-BIGM-001", "type": MovementType.TRANSFER, "quantity": 120, "source": "RES-01", "target": "CUIS-01", "reason": "Réassort avant le service du midi", "created_at": "2026-09-15T10:15:00+00:00"},
    {"sku": "STEA-HAC-045", "type": MovementType.IN, "quantity": 360, "source": None, "target": "CONG-01", "reason": "Livraison Viandes du Charolais", "created_at": "2026-09-16T05:00:00+00:00"},
    {"sku": "STEA-HAC-045", "type": MovementType.OUT, "quantity": 240, "source": "CONG-01", "target": None, "reason": "Cuissons du service du midi", "created_at": "2026-09-16T13:40:00+00:00"},
    {"sku": "FRIT-SUR-250", "type": MovementType.TRANSFER, "quantity": 24, "source": "CONG-01", "target": "CUIS-01", "reason": "Approvisionnement de la friteuse", "created_at": "2026-09-17T11:00:00+00:00"},
    {"sku": "SIRO-COL-010", "type": MovementType.OUT, "quantity": 3, "source": "RES-01", "target": None, "reason": "Poches branchées sur la fontaine", "created_at": "2026-09-17T18:20:00+00:00"},
]


def seed(db: Session) -> bool:
    if db.execute(select(Product)).scalars().first() is not None:
        return False

    categories = {}
    for data in CATEGORIES:
        category = Category(name=data["name"], description=data["description"])
        db.add(category)
        categories[data["name"]] = category

    suppliers = {}
    for data in SUPPLIERS:
        supplier = Supplier(name=data["name"], email=data["email"], phone=data["phone"], address=data["address"])
        db.add(supplier)
        suppliers[data["name"]] = supplier

    locations = {}
    for data in LOCATIONS:
        location = Location(code=data["code"], name=data["name"], description=data["description"])
        db.add(location)
        locations[data["code"]] = location

    db.flush()

    products = {}
    for data in PRODUCTS:
        product = Product(
            sku=data["sku"],
            name=data["name"],
            description=data["description"],
            barcode=data["barcode"],
            unit_price=Decimal(data["unit_price"]),
            reorder_threshold=data["reorder_threshold"],
            category_id=categories[data["category"]].id,
            supplier_id=suppliers[data["supplier"]].id,
        )
        db.add(product)
        db.flush()
        products[data["sku"]] = product
        for code, quantity in data["stocks"].items():
            db.add(Stock(product_id=product.id, location_id=locations[code].id, quantity=quantity))

    admin = db.execute(select(User).where(User.email == ADMIN_EMAIL)).scalars().first()
    if admin is None:
        admin = User(
            email=ADMIN_EMAIL,
            full_name="Admin Demo",
            hashed_password=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.flush()

    # History only: the stock quantities above are already the current state.
    for data in MOVEMENTS:
        db.add(
            StockMovement(
                product_id=products[data["sku"]].id,
                type=data["type"],
                quantity=data["quantity"],
                source_location_id=locations[data["source"]].id if data["source"] else None,
                target_location_id=locations[data["target"]].id if data["target"] else None,
                reason=data["reason"],
                user_id=admin.id,
                created_at=datetime.fromisoformat(data["created_at"]),
            )
        )

    db.commit()
    return True


if __name__ == "__main__":
    session = SessionLocal()
    try:
        if seed(session):
            print(f"Demo data inserted. Log in with {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
        else:
            print("Products already exist: nothing inserted.")
    finally:
        session.close()
