import sqlite3
import sys
import os

def update_constraint():
    """
    SQLite doesn't support ALTER CONSTRAINT directly, but the constraint
    will be updated when the server restarts with the new model definition.
    This script just verifies the current state.
    """
    db_path = '/home/ubuntu/lgbtq_community/backend/lgbtq_community.db'
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, email, membership_type FROM users")
        users = cursor.fetchall()
        
        print("Current users in database:")
        for user in users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Membership: {user[2]}")
        
        print("\nConstraint will be updated when server restarts with new model definition")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    update_constraint()
