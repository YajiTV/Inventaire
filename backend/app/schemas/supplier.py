from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ReadModel


class SupplierBase(BaseModel):
    name: str = Field(min_length=1, max_length=120, examples=["Ferrero France"])
    email: EmailStr | None = Field(default=None, examples=["commandes@ferrero.fr"])
    phone: str | None = Field(default=None, max_length=20, examples=["0320000000"])
    address: str | None = Field(default=None, max_length=255, examples=["18 rue de Mons, 76130 Mont-Saint-Aignan"])


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120, examples=["Ferrero"])
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)


class SupplierRead(ReadModel, SupplierBase):
    id: int = Field(examples=[1])
