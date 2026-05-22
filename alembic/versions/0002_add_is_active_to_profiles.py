"""add is_active to financial_profiles

Revision ID: 0002_add_is_active
Revises: 0001_initial
Create Date: 2026-05-22
"""
from alembic import op
import sqlalchemy as sa

revision = '0002_add_is_active'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('financial_profiles', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')))


def downgrade():
    op.drop_column('financial_profiles', 'is_active')
