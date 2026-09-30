"""add image url to products

Revision ID: 9cd9621632ab
Revises: fc099896c71e
Create Date: 2026-09-28 10:30:52.960376

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9cd9621632ab'
down_revision: Union[str, Sequence[str], None] = 'fc099896c71e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('products', sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('products', 'image_url')
