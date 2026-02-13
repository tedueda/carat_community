"""add stripe kyc and events

Revision ID: 20260212_add_stripe_kyc_and_events
Revises: 20260202_add_salon_message_translations
Create Date: 2026-02-12 18:42:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260212_add_stripe_kyc_and_events'
down_revision = '20260202_add_salon_message_translations'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add kyc_verified_at column to users table
    op.add_column('users', sa.Column('kyc_verified_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add membership_status column to users table (for subscription status)
    op.add_column('users', sa.Column('membership_status', sa.String(50), nullable=False, server_default='free'))
    op.create_check_constraint('check_membership_status', 'users', "membership_status IN ('free', 'paid')")
    
    # Create stripe_events table for webhook idempotency
    op.create_table(
        'stripe_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.String(255), nullable=False),
        sa.Column('type', sa.String(100), nullable=False),
        sa.Column('payload_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', name='uq_stripe_event_id')
    )
    op.create_index('ix_stripe_events_event_id', 'stripe_events', ['event_id'])
    op.create_index('ix_stripe_events_type', 'stripe_events', ['type'])


def downgrade() -> None:
    # Drop stripe_events table
    op.drop_index('ix_stripe_events_type', table_name='stripe_events')
    op.drop_index('ix_stripe_events_event_id', table_name='stripe_events')
    op.drop_table('stripe_events')
    
    # Remove columns from users table
    op.drop_constraint('check_membership_status', 'users', type_='check')
    op.drop_column('users', 'membership_status')
    op.drop_column('users', 'kyc_verified_at')
