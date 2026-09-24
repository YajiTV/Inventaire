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
    # Which location is filled in depends on the type: an incoming movement has
    # no source, an outgoing one has no target, a transfer has both.
    source_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id"), nullable=True, index=True
    )
    target_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id"), nullable=True, index=True
    )
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Who did it: the movement is the audit trail of the inventory.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
