"""add matching profile enhancements

Revision ID: 20251017_matching
Revises: 68253ac0121c
Create Date: 2025-10-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251017_matching'
down_revision = '68253ac0121c'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    
    table_exists = conn.execute(sa.text(
        "SELECT to_regclass('public.matching_profiles')"
    )).scalar()
    
    if not table_exists:
        op.execute(sa.text("""
            CREATE TABLE matching_profiles (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                display_flag BOOLEAN NOT NULL DEFAULT true,
                prefecture VARCHAR(100) NOT NULL DEFAULT '',
                age_band VARCHAR(50),
                occupation VARCHAR(100),
                income_range VARCHAR(100),
                meet_pref VARCHAR(50),
                bio TEXT,
                identity VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
    
    avatar_exists = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='matching_profiles' AND column_name='avatar_url'"
    )).fetchone()
    
    if not avatar_exists:
        op.add_column('matching_profiles', sa.Column('avatar_url', sa.String(500), nullable=True))
    
    meeting_style_exists = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='matching_profiles' AND column_name='meeting_style'"
    )).fetchone()
    
    if not meeting_style_exists:
        op.add_column('matching_profiles', sa.Column('meeting_style', sa.String(50), nullable=True))
    
    # meet_pref の既存値を meeting_style にコピー（互換性のため）
    # meet_pref カラムが存在する場合のみコピーを実行
    meet_pref_exists = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='matching_profiles' AND column_name='meet_pref'"
    )).fetchone()
    
    if meet_pref_exists:
        op.execute(sa.text("""
            UPDATE matching_profiles 
            SET meeting_style = meet_pref 
            WHERE meet_pref IS NOT NULL AND meeting_style IS NULL
        """))


def downgrade():
    op.drop_column('matching_profiles', 'meeting_style')
    op.drop_column('matching_profiles', 'avatar_url')
