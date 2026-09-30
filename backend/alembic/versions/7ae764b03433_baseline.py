"""baseline

Revision ID: 7ae764b03433
Revises: 
Create Date: 2026-09-14 12:19:06.192288

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7ae764b03433'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
