"""create tables purchase_orders and order_lines

Revision ID: b7c1a4e2f905
Revises: fbed9c11af8f
Create Date: 2026-09-24 10:12:44.310582

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c1a4e2f905'
down_revision: Union[str, Sequence[str], None] = 'fbed9c11af8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('purchase_orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('reference', sa.String(length=40), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('location_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.Enum('DRAFT', 'SENT', 'RECEIVED', 'CANCELLED', name='orderstatus'), nullable=False),
    sa.Column('ordered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('received_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['location_id'], ['locations.id'], name=op.f('fk_purchase_orders_location_id_locations')),
    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], name=op.f('fk_purchase_orders_supplier_id_suppliers')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_purchase_orders'))
    )
    op.create_index(op.f('ix_purchase_orders_location_id'), 'purchase_orders', ['location_id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_reference'), 'purchase_orders', ['reference'], unique=True)
    op.create_index(op.f('ix_purchase_orders_supplier_id'), 'purchase_orders', ['supplier_id'], unique=False)
    op.create_table('order_lines',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['purchase_orders.id'], name=op.f('fk_order_lines_order_id_purchase_orders'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], name=op.f('fk_order_lines_product_id_products')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_order_lines'))
    )
    op.create_index(op.f('ix_order_lines_order_id'), 'order_lines', ['order_id'], unique=False)
    op.create_index(op.f('ix_order_lines_product_id'), 'order_lines', ['product_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_order_lines_product_id'), table_name='order_lines')
    op.drop_index(op.f('ix_order_lines_order_id'), table_name='order_lines')
    op.drop_table('order_lines')
    op.drop_index(op.f('ix_purchase_orders_supplier_id'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_reference'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_location_id'), table_name='purchase_orders')
    op.drop_table('purchase_orders')
    sa.Enum(name='orderstatus').drop(op.get_bind(), checkfirst=True)
