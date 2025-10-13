#!/usr/bin/env python3

import sqlite3
import bcrypt
from datetime import datetime

def fix_database():
    """Fix database schema issues"""
    try:
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        print("=== Fixing Database Schema ===")
        
        # Get current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("Current columns in users table:")
        for col in columns:
            print(f"  {col[1]} {col[2]}")
        
        # Check if is_active column exists
        column_names = [col[1] for col in columns]
        
        if 'is_active' not in column_names:
            print("\nAdding missing 'is_active' column...")
            cursor.execute('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1')
            print("✅ Added is_active column")
        
        # Update all existing users to be active
        cursor.execute('UPDATE users SET is_active = 1 WHERE is_active IS NULL')
        
        # Show current users
        cursor.execute('SELECT id, username, email, is_active FROM users')
        users = cursor.fetchall()
        print(f"\n=== Current Users ({len(users)}) ===")
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Active: {user[3]}")
        
        # If no users exist, create a test user
        if len(users) == 0:
            print("\n=== Creating Test User ===")
            test_password = "admin123"
            password_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cursor.execute('''
                INSERT INTO users (username, password_hash, email, created_date, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', ('admin', password_hash, 'admin@smartsecure.lk', datetime.now().isoformat(), 1))
            print("✅ Created admin user (username: admin, password: admin123)")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Database fixed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        return False

def test_login():
    """Test login functionality"""
    try:
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        print("\n=== Testing Login Function ===")
        
        # Get first user
        cursor.execute('SELECT username, password_hash FROM users LIMIT 1')
        user = cursor.fetchone()
        
        if user:
            username, password_hash = user
            print(f"Testing login for user: {username}")
            
            # Test with common passwords
            test_passwords = ['admin123', 'password', 'test123', 'admin']
            
            for pwd in test_passwords:
                try:
                    if bcrypt.checkpw(pwd.encode('utf-8'), password_hash.encode('utf-8')):
                        print(f"✅ Correct password: {pwd}")
                        return username, pwd
                except:
                    continue
            
            print("❌ Could not determine password")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Login test error: {e}")
    
    return None, None

if __name__ == "__main__":
    if fix_database():
        username, password = test_login()
        if username and password:
            print(f"\n🎉 You can now login with:")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
        else:
            print(f"\n🎉 Database fixed! Try logging in with:")
            print(f"   Username: admin")
            print(f"   Password: admin123")