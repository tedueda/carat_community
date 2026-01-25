import requests
import sqlite3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth import verify_password

def test_complete_login():
    print("=== Testing Complete Login Functionality ===")
    
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, password_hash, membership_type FROM users")
    users = cursor.fetchall()
    
    print("\n=== Database Users ===")
    for user in users:
        print(f"ID: {user[0]}, Email: {user[1]}, Membership: {user[3]}")
    
    print("\n=== Testing Password Verification ===")
    
    cursor.execute("SELECT password_hash FROM users WHERE email = ?", ("tedyueda@gmail.com",))
    ted_hash = cursor.fetchone()
    if ted_hash:
        try:
            is_valid = verify_password("tedyueda2024!", ted_hash[0])
            print(f"Ted password verification: {is_valid}")
        except Exception as e:
            print(f"Ted password verification error: {e}")
    
    cursor.execute("SELECT password_hash FROM users WHERE email = ?", ("admin@rainbow.com",))
    admin_hash = cursor.fetchone()
    if admin_hash:
        try:
            is_valid = verify_password("admin123", admin_hash[0])
            print(f"Admin password verification: {is_valid}")
        except Exception as e:
            print(f"Admin password verification error: {e}")
    
    print("\n=== Testing API Login ===")
    
    ted_data = {
        "username": "tedyueda@gmail.com",
        "password": "tedyueda2024!"
    }
    
    try:
        response = requests.post("http://localhost:8000/auth/token", data=ted_data)
        print(f"Ted login status: {response.status_code}")
        if response.status_code == 200:
            print("Ted login successful!")
            token = response.json()["access_token"]
            print(f"Token received: {token[:50]}...")
        else:
            print(f"Ted login failed: {response.text}")
    except Exception as e:
        print(f"Ted login error: {e}")
    
    admin_data = {
        "username": "admin@rainbow.com", 
        "password": "admin123"
    }
    
    try:
        response = requests.post("http://localhost:8000/auth/token", data=admin_data)
        print(f"Admin login status: {response.status_code}")
        if response.status_code == 200:
            print("Admin login successful!")
            token = response.json()["access_token"]
            print(f"Token received: {token[:50]}...")
        else:
            print(f"Admin login failed: {response.text}")
    except Exception as e:
        print(f"Admin login error: {e}")
    
    conn.close()

if __name__ == "__main__":
    test_complete_login()
