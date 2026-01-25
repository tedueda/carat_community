"""add_matching_profile_fields_idempotent

Revision ID: 7a24683abf6e
Revises: 1d109dfa4081
Create Date: 2025-11-08 03:03:57.522556

"""
from alembic import op
import sqlalchemy as sa


revision = '7a24683abf6e'
down_revision = '1d109dfa4081'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('matching_profiles', sa.Column('residence_detail', sa.String(length=100), nullable=True))
    op.add_column('matching_profiles', sa.Column('hometown', sa.String(length=100), nullable=True))
    op.add_column('matching_profiles', sa.Column('blood_type', sa.String(length=20), nullable=True))
    op.add_column('matching_profiles', sa.Column('zodiac', sa.String(length=20), nullable=True))
    
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='residence_detail'
            ) THEN
                ALTER TABLE matching_profiles ADD COLUMN residence_detail VARCHAR(100);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='hometown'
            ) THEN
                ALTER TABLE matching_profiles ADD COLUMN hometown VARCHAR(100);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='blood_type'
            ) THEN
                ALTER TABLE matching_profiles ADD COLUMN blood_type VARCHAR(20);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='zodiac'
            ) THEN
                ALTER TABLE matching_profiles ADD COLUMN zodiac VARCHAR(20);
            END IF;
        END $$;
    """)


def downgrade():
    op.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='zodiac'
            ) THEN
                ALTER TABLE matching_profiles DROP COLUMN zodiac;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='blood_type'
            ) THEN
                ALTER TABLE matching_profiles DROP COLUMN blood_type;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='hometown'
            ) THEN
                ALTER TABLE matching_profiles DROP COLUMN hometown;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='matching_profiles' AND column_name='residence_detail'
            ) THEN
                ALTER TABLE matching_profiles DROP COLUMN residence_detail;
            END IF;
        END $$;
    """)
    
    try:
        op.drop_column('matching_profiles', 'zodiac')
        op.drop_column('matching_profiles', 'blood_type')
        op.drop_column('matching_profiles', 'hometown')
        op.drop_column('matching_profiles', 'residence_detail')
    except:
        pass
