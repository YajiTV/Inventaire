"""add foreign key from stocks to products

Revision ID: d4e8b2f61a93
Revises: a1f9c7d3e820
Create Date: 2026-09-30 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'd4e8b2f61a93'
down_revision: Union[str, Sequence[str], None] = 'a1f9c7d3e820'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("DELETE FROM stocks WHERE product_id NOT IN (SELECT id FROM products)")
    op.create_foreign_key(op.f('fk_stocks_product_id_products'), 'stocks', 'products', ['product_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('fk_stocks_product_id_products'), 'stocks', type_='foreignkey')
