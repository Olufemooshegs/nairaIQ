"""add indexes and created_at server defaults

Revision ID: 0004_add_indexes
Revises: 0003_create_analytics
Create Date: 2026-05-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0004_add_indexes'
down_revision = '0003_create_analytics'
branch_labels = None
depends_on = None


def upgrade():
    # set server default for created_at columns so DB populates timestamps
    op.alter_column('users', 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('onboarding_inputs', 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('financial_profiles', 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('analytics_states', 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('financial_insights', 'created_at', server_default=sa.text('now()'), existing_type=sa.DateTime(), existing_nullable=True)

    # indexes for faster queries
    op.create_index('ix_analytics_states_user_id', 'analytics_states', ['user_id'])
    op.create_index('ix_analytics_states_created_at', 'analytics_states', ['created_at'])
    op.create_index('ix_financial_insights_analytics_state_id', 'financial_insights', ['analytics_state_id'])


def downgrade():
    op.drop_index('ix_financial_insights_analytics_state_id', table_name='financial_insights')
    op.drop_index('ix_analytics_states_created_at', table_name='analytics_states')
    op.drop_index('ix_analytics_states_user_id', table_name='analytics_states')

    op.alter_column('financial_insights', 'created_at', server_default=None, existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('analytics_states', 'created_at', server_default=None, existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('financial_profiles', 'created_at', server_default=None, existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('onboarding_inputs', 'created_at', server_default=None, existing_type=sa.DateTime(), existing_nullable=True)
    op.alter_column('users', 'created_at', server_default=None, existing_type=sa.DateTime(), existing_nullable=True)
