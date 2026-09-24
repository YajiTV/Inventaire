from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.schemas.enums import OrderStatus

if TYPE_CHECKING:
    from app.models.order_line import OrderLine


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=True), default=OrderStatus.DRAFT, nullable=False
    )
    ordered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # Filled in when the order moves to "received", stays null otherwise.
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # selectin loading: the read schema always exposes the lines, so the list
    # endpoint would otherwise issue one extra query per order.
    lines: Mapped[list["OrderLine"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )

    @property
    def total_price(self) -> Decimal:
        # Derived, never stored: a column would drift as soon as a line changes.
        return sum((line.quantity * line.unit_price for line in self.lines), Decimal("0.00"))
