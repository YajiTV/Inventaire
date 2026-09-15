from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    OPERATOR = "operator"


class MovementType(StrEnum):
    IN = "in"
    OUT = "out"
    TRANSFER = "transfer"


class OrderStatus(StrEnum):
    DRAFT = "draft"
    SENT = "sent"
    RECEIVED = "received"
    CANCELLED = "cancelled"
