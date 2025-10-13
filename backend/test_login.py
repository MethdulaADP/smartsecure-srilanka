#!/usr/bin/env python3

import sqlite3
import bcrypt
import json

# Test database connection and check users
def test_database():
    try:
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("Database tables:", tables)
        
        # Check users table
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"Total users: {user_count}")
        
        if user_count > 0:
            cursor.execute("SELECT id, username, email, is_active FROM users LIMIT 5")
            users = cursor.fetchall()
            print("Sample users:")
            for user in users:
                print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Active: {user[3]}")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

# Test login function
def test_login(username, password):
    try:
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, password_hash, email, is_active FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if not user:
            print(f"User '{username}' not found")
            return False
            
        user_id, password_hash, email, is_active = user
        print(f"Found user: ID={user_id}, Email={email}, Active={is_active}")
        
        if not is_active:
            print("User account is inactive")
            return False
            
        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
            print("Password correct - login should work")
            return True
        else:
            print("Password incorrect")
            return False
            
    except Exception as e:
        print(f"Login test error: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== Testing SmartSecure Database ===")
    
    # Test database
    if test_database():
        print("\n=== Testing Login ===")
        
        # Test with common usernames
        test_users = [
            ("admin", "admin123"),
            ("test", "password"),
            ("user", "user123"),
            ("pamith", "password123")
        ]
        
        for username, password in test_users:
            print(f"\nTesting login for '{username}':")
            test_login(username, password)