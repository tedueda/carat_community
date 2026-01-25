#!/usr/bin/env python3
"""
Schema Verification Script
Compares RDS database schema with SQLAlchemy models
"""
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, inspect, MetaData
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app import models

def get_db_url():
    """Get DATABASE_URL from environment"""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL environment variable not set")
        sys.exit(1)
    return db_url

def get_rds_schema(engine):
    """Get actual schema from RDS"""
    inspector = inspect(engine)
    rds_tables = {}
    
    for table_name in inspector.get_table_names():
        columns = {}
        for col in inspector.get_columns(table_name):
            columns[col['name']] = {
                'type': str(col['type']),
                'nullable': col['nullable'],
                'default': col.get('default'),
            }
        rds_tables[table_name] = columns
    
    return rds_tables

def get_model_schema():
    """Get schema from SQLAlchemy models"""
    model_tables = {}
    
    for table_name, table in Base.metadata.tables.items():
        columns = {}
        for col in table.columns:
            columns[col.name] = {
                'type': str(col.type),
                'nullable': col.nullable,
                'default': str(col.default) if col.default else None,
            }
        model_tables[table_name] = columns
    
    return model_tables

def compare_schemas(rds_tables, model_tables):
    """Compare RDS and model schemas"""
    issues = []
    
    rds_only = set(rds_tables.keys()) - set(model_tables.keys())
    if rds_only:
        issues.append(f"⚠️  Tables in RDS but not in models: {', '.join(sorted(rds_only))}")
    
    model_only = set(model_tables.keys()) - set(rds_tables.keys())
    if model_only:
        issues.append(f"⚠️  Tables in models but not in RDS: {', '.join(sorted(model_only))}")
    
    common_tables = set(rds_tables.keys()) & set(model_tables.keys())
    for table_name in sorted(common_tables):
        rds_cols = set(rds_tables[table_name].keys())
        model_cols = set(model_tables[table_name].keys())
        
        rds_only_cols = rds_cols - model_cols
        if rds_only_cols:
            issues.append(f"⚠️  Table '{table_name}': Columns in RDS but not in models: {', '.join(sorted(rds_only_cols))}")
        
        model_only_cols = model_cols - rds_cols
        if model_only_cols:
            issues.append(f"❌ Table '{table_name}': Columns in models but not in RDS: {', '.join(sorted(model_only_cols))}")
    
    return issues

def main():
    print("🔍 Schema Verification Script")
    print("=" * 60)
    
    db_url = get_db_url()
    print(f"📊 Connecting to database...")
    
    engine = create_engine(db_url)
    
    print("📥 Fetching RDS schema...")
    rds_tables = get_rds_schema(engine)
    print(f"   Found {len(rds_tables)} tables in RDS")
    
    print("📥 Fetching model schema...")
    model_tables = get_model_schema()
    print(f"   Found {len(model_tables)} tables in models")
    
    print("\n🔍 Comparing schemas...")
    issues = compare_schemas(rds_tables, model_tables)
    
    print("\n" + "=" * 60)
    if not issues:
        print("✅ No schema mismatches found!")
        return 0
    else:
        print(f"❌ Found {len(issues)} schema issues:\n")
        for issue in issues:
            print(f"   {issue}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
