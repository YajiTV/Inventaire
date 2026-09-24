from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# Modèle SQLAlchemy pour la table "suppliers"
class Supplier(Base):
    __tablename__ = "suppliers"

    # Clé primaire, auto-incrémentée par la base
    id: Mapped[int] = mapped_column(primary_key=True)
    # Nom obligatoire (mêmes limites que le schéma Pydantic : 120 caractères)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Champs optionnels -> "| None" + nullable=True
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)