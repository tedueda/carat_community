"""add_chat_request_table

Revision ID: add_chat_request_001
Revises: 7a24683abf6e
Create Date: 2025-11-09 04:49:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_chat_request_001'
down_revision = '7a24683abf6e'
branch_labels = None
depends_on = None


def upgrade():
    # Create chat_requests table
    op.create_table('chat_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('from_user_id', sa.Integer(), nullable=False),
        sa.Column('to_user_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('initial_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('pending','accepted','declined')", name='check_chat_request_status'),
        sa.CheckConstraint('from_user_id != to_user_id', name='check_chat_request_distinct_users'),
        sa.ForeignKeyConstraint(['from_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['to_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('from_user_id', 'to_user_id', 'status', name='uniq_chat_request_pending')
    )
    op.create_index(op.f('ix_chat_requests_id'), 'chat_requests', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_chat_requests_id'), table_name='chat_requests')
    op.drop_table('chat_requests')
