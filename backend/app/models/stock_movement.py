from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.schemas.enums import MovementType


class StockMovement(Base):
    """
    Ledger of every stock change. A row is never updated nor deleted: it is the
    trace of what happened, the current quantities live in "stocks".
    """

    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    type: Mapped[MovementType] = mapped_column(Enum(MovementType, native_enum=True), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    # Depends on the type: "in" has no source, "out" no target, a transfer has both.
    source_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id"), nullable=True, index=True
    )
    target_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id"), nullable=True, index=True
    )
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
