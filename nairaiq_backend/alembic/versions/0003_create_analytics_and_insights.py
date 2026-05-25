"""create analytics_states and financial_insights tables

Revision ID: 0003_create_analytics_and_insights
Revises: 0002_add_is_active
Create Date: 2026-05-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0003_create_analytics_and_insights'
down_revision = '0002_add_is_active'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'analytics_states',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('financial_profiles.id'), nullable=False),
        sa.Column('metrics', postgresql.JSONB(), nullable=False),
        sa.Column('scores', postgresql.JSONB(), nullable=False),
        sa.Column('meta', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'financial_insights',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('analytics_state_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('analytics_states.id'), nullable=False),
        sa.Column('intent', sa.String(length=100), nullable=False),
        sa.Column('rendered', postgresql.JSONB(), nullable=False),
        sa.Column('meta', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('financial_insights')
    op.drop_table('analytics_states')
