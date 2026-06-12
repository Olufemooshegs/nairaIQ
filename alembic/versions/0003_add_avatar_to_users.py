"""add avatar_url to users

Revision ID: 0003_add_avatar_to_users
Revises: 0002_add_is_active
Create Date: 2026-06-12
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_add_avatar_to_users'
down_revision = '0002_add_is_active'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('avatar_url', sa.String(length=512), nullable=True))


def downgrade():
    op.drop_column('users', 'avatar_url')

