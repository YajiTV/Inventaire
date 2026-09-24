from decimal import Decimal

from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# Modèle SQLAlchemy pour la table "products"
class Product(Base):
    __tablename__ = "products"

    # Clé primaire, auto-incrémentée par la base
    id: Mapped[int] = mapped_column(primary_key=True)
    # Référence interne unique (ex : "CAFE-001"), unique=True empêche les doublons en base
    sku: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    # Code-barres optionnel (servira plus tard pour Open Food Facts)
    barcode: Mapped[str | None] = mapped_column(String(14), nullable=True)
    # Prix : Numeric(10, 2) = nombre exact à 2 décimales (pas de float pour de l'argent)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    # Seuil sous lequel il faut réapprovisionner
    reorder_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Pour l'instant de simples colonnes : les ForeignKey viendront dans la tâche "Relations"
    category_id: Mapped[int] = mapped_column(Integer, nullable=False)
    supplier_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
