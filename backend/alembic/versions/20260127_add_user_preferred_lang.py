"""Add preferred_lang to users and translation tables for comments/messages

Revision ID: 20260127_user_lang
Revises: 20260127_add_post_translations
Create Date: 2026-01-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260127_user_lang'
down_revision = '20260127_add_post_translations'
branch_labels = None
depends_on = None


def upgrade():
    # Add preferred_lang column to users table
    op.add_column('users', sa.Column('preferred_lang', sa.String(10), nullable=True, server_default='ja'))
    
    # Create comment_translations table
    op.create_table(
        'comment_translations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('comment_id', sa.Integer(), nullable=False),
        sa.Column('lang', sa.String(10), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False, server_default='openai'),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('comment_id', 'lang', name='uq_comment_translation_lang')
    )
    op.create_index('ix_comment_translations_comment_id', 'comment_translations', ['comment_id'])
    op.create_index('ix_comment_translations_lang', 'comment_translations', ['lang'])
    
    # Create message_translations table
    op.create_table(
        'message_translations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('lang', sa.String(10), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False, server_default='openai'),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('message_id', 'lang', name='uq_message_translation_lang')
    )
    op.create_index('ix_message_translations_message_id', 'message_translations', ['message_id'])
    op.create_index('ix_message_translations_lang', 'message_translations', ['lang'])


def downgrade():
    op.drop_table('message_translations')
    op.drop_table('comment_translations')
    op.drop_column('users', 'preferred_lang')
