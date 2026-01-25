import sqlite3
import sys
import os

sys.path.append('/home/ubuntu/lgbtq_community/backend')

def check_database():
    db_path = '/home/ubuntu/lgbtq_community/backend/lgbtq_community.db'
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("Users table not found")
            return
        
        cursor.execute('SELECT id, email, display_name, membership_type FROM users')
        users = cursor.fetchall()
        
        print('Current users in database:')
        if not users:
            print('  No users found')
        else:
            for user in users:
                print(f'  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Membership: {user[3]}')
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'")
        if cursor.fetchone():
            cursor.execute('SELECT COUNT(*) FROM posts')
            post_count = cursor.fetchone()[0]
            print(f'\nTotal posts in database: {post_count}')
        else:
            print('\nPosts table not found')
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_database()
