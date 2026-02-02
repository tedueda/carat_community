"""Add salon_message_translations table

Revision ID: 20260202_salon_msg_trans
Revises: 20260129_nationality
Create Date: 2026-02-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '20260202_salon_msg_trans'
down_revision = '20260129_nationality'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if salon_messages table exists (it may not exist in CI test environment)
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'salon_messages' not in tables:
        print("Skipping salon_message_translations: salon_messages table does not exist")
        return
    
    # Check if table already exists
    if 'salon_message_translations' in tables:
        print("salon_message_translations table already exists, skipping")
        return
    
    # Create salon_message_translations table
    op.create_table(
        'salon_message_translations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('salon_message_id', sa.Integer(), nullable=False),
        sa.Column('lang', sa.String(10), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False, server_default='openai'),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['salon_message_id'], ['salon_messages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('salon_message_id', 'lang', name='uq_salon_message_translation_lang')
    )
    op.create_index('ix_salon_message_translations_id', 'salon_message_translations', ['id'])
    op.create_index('ix_salon_message_translations_salon_message_id', 'salon_message_translations', ['salon_message_id'])
    op.create_index('ix_salon_message_translations_lang', 'salon_message_translations', ['lang'])


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'salon_message_translations' not in tables:
        return
    
    op.drop_index('ix_salon_message_translations_lang', table_name='salon_message_translations')
    op.drop_index('ix_salon_message_translations_salon_message_id', table_name='salon_message_translations')
    op.drop_index('ix_salon_message_translations_id', table_name='salon_message_translations')
    op.drop_table('salon_message_translations')
