from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
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
    # Clés étrangères : la base refuse un id qui n'existe pas dans la table visée
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    # Si le fournisseur est supprimé, le produit reste mais n'a plus de fournisseur (NULL)
    supplier_id: Mapped[int | None] = mapped_column(
        ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True
    )

    # PAS une colonne (pas de Mapped/mapped_column) : simple attribut Python,
    # rempli par le service avec la somme des quantités de la table stocks
    total_quantity = 0
