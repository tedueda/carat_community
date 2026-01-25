"""add categories and subcategories tables

Revision ID: 588b4fd8ab1a
Revises: 4daec458e3d1
Create Date: 2025-10-26 08:02:00.631311

"""
from alembic import op
import sqlalchemy as sa


revision = '588b4fd8ab1a'
down_revision = '4daec458e3d1'
branch_labels = None
depends_on = None


def upgrade():
    # Categories テーブル作成
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    
    # Subcategories テーブル作成
    op.create_table(
        'subcategories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('category_id', 'slug', name='uq_category_subcategory_slug')
    )
    op.create_index(op.f('ix_subcategories_id'), 'subcategories', ['id'], unique=False)
    
    # Posts テーブルに外部キーカラムを追加
    op.add_column('posts', sa.Column('category_id', sa.Integer(), nullable=True))
    op.add_column('posts', sa.Column('subcategory_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_posts_category_id', 'posts', 'categories', ['category_id'], ['id'])
    op.create_foreign_key('fk_posts_subcategory_id', 'posts', 'subcategories', ['subcategory_id'], ['id'])


def downgrade():
    # Posts テーブルから外部キーとカラムを削除
    op.drop_constraint('fk_posts_subcategory_id', 'posts', type_='foreignkey')
    op.drop_constraint('fk_posts_category_id', 'posts', type_='foreignkey')
    op.drop_column('posts', 'subcategory_id')
    op.drop_column('posts', 'category_id')
    
    # Subcategories テーブル削除
    op.drop_index(op.f('ix_subcategories_id'), table_name='subcategories')
    op.drop_table('subcategories')
    
    # Categories テーブル削除
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
