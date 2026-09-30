from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.location import Location


class Stock(Base):
    __tablename__ = "stocks"
    __table_args__ = (UniqueConstraint("product_id", "location_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    # Supprimer un produit supprime ses lignes de stock
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    location: Mapped[Location] = relationship(back_populates="stocks")
