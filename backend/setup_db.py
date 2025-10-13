#!/usr/bin/env python3
"""
SmartSecure Sri Lanka - Database Setup and Test User Creation
This script creates a test user for development and testing purposes.
"""
import sqlite3
import hashlib
from pathlib import Path
import os

# Database setup
APP_ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get('SMARTSECURE_DB', APP_ROOT / 'smartsecure.db'))

def create_test_user():
    """Create a test user for development"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Create tables if they don't exist
        cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_date TEXT
        )''')
        
        # Check if test user already exists
        cur.execute('SELECT username FROM users WHERE username = ?', ('testuser',))
        if cur.fetchone():
            print("✅ Test user already exists")
            print("Username: testuser")
            print("Password: password123")
            conn.close()
            return
        
        # Create test user with simple SHA256 (for compatibility)
        test_password = "password123"
        password_hash = hashlib.sha256(test_password.encode('utf-8')).hexdigest()
        
        cur.execute('''INSERT INTO users (username, password_hash, email, created_date) 
                      VALUES (?, ?, ?, datetime('now'))''', 
                   ('testuser', password_hash, 'test@smartsecure.lk'))
        
        conn.commit()
        conn.close()
        
        print("✅ Test user created successfully!")
        print("Username: testuser")
        print("Password: password123")
        print("Email: test@smartsecure.lk")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")

if __name__ == "__main__":
    print("🔧 SmartSecure Sri Lanka - Database Setup")
    print(f"Database: {DB_PATH}")
    create_test_user()