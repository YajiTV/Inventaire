"""create table stock_movements

Revision ID: c3a9d0e51b47
Revises: b7c1a4e2f905
Create Date: 2026-09-24 14:38:12.905441

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3a9d0e51b47'
down_revision: Union[str, Sequence[str], None] = 'b7c1a4e2f905'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('stock_movements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('type', sa.Enum('IN', 'OUT', 'TRANSFER', name='movementtype'), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('source_location_id', sa.Integer(), nullable=True),
    sa.Column('target_location_id', sa.Integer(), nullable=True),
    sa.Column('reason', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], name=op.f('fk_stock_movements_product_id_products')),
    sa.ForeignKeyConstraint(['source_location_id'], ['locations.id'], name=op.f('fk_stock_movements_source_location_id_locations')),
    sa.ForeignKeyConstraint(['target_location_id'], ['locations.id'], name=op.f('fk_stock_movements_target_location_id_locations')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_stock_movements_user_id_users')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_stock_movements'))
    )
    op.create_index(op.f('ix_stock_movements_product_id'), 'stock_movements', ['product_id'], unique=False)
    op.create_index(op.f('ix_stock_movements_source_location_id'), 'stock_movements', ['source_location_id'], unique=False)
    op.create_index(op.f('ix_stock_movements_target_location_id'), 'stock_movements', ['target_location_id'], unique=False)
    op.create_index(op.f('ix_stock_movements_user_id'), 'stock_movements', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_stock_movements_user_id'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_target_location_id'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_source_location_id'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_product_id'), table_name='stock_movements')
    op.drop_table('stock_movements')
    sa.Enum(name='movementtype').drop(op.get_bind(), checkfirst=True)
