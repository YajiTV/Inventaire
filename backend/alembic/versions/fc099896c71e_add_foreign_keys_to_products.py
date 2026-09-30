"""add foreign keys to products

Revision ID: fc099896c71e
Revises: c3a9d0e51b47
Create Date: 2026-09-28 09:42:08.291952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'fc099896c71e'
down_revision: Union[str, Sequence[str], None] = 'c3a9d0e51b47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f('fk_products_supplier_id_suppliers'), 'products', 'suppliers', ['supplier_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(op.f('fk_products_category_id_categories'), 'products', 'categories', ['category_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('fk_products_category_id_categories'), 'products', type_='foreignkey')
    op.drop_constraint(op.f('fk_products_supplier_id_suppliers'), 'products', type_='foreignkey')
