"""Add post_translations table and original_lang column

Revision ID: 20260127_translations
Revises: add_jewelry_001
Create Date: 2026-01-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260127_translations'
down_revision = 'add_jewelry_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add original_lang column to posts table
    op.add_column('posts', sa.Column('original_lang', sa.String(10), nullable=True, server_default='unknown'))
    
    # Create post_translations table
    op.create_table(
        'post_translations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('lang', sa.String(10), nullable=False),
        sa.Column('translated_title', sa.String(200), nullable=True),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False, server_default='openai'),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('post_id', 'lang', name='uq_post_translation_lang')
    )
    op.create_index(op.f('ix_post_translations_id'), 'post_translations', ['id'], unique=False)
    op.create_index(op.f('ix_post_translations_post_id'), 'post_translations', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_translations_lang'), 'post_translations', ['lang'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_post_translations_lang'), table_name='post_translations')
    op.drop_index(op.f('ix_post_translations_post_id'), table_name='post_translations')
    op.drop_index(op.f('ix_post_translations_id'), table_name='post_translations')
    op.drop_table('post_translations')
    op.drop_column('posts', 'original_lang')
