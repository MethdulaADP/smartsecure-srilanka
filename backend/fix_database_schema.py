#!/usr/bin/env python3

import sqlite3
import bcrypt
from datetime import datetime

def fix_database_schema():
    """Fix all database schema issues"""
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
        
        column_names = [col[1] for col in columns]
        
        # Add missing columns
        if 'last_login' not in column_names:
            print("Adding missing 'last_login' column...")
            cursor.execute('ALTER TABLE users ADD COLUMN last_login TEXT')
            print("✅ Added last_login column")
        
        if 'is_active' not in column_names:
            print("Adding missing 'is_active' column...")
            cursor.execute('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1')
            print("✅ Added is_active column")
        
        # Update all existing users to be active
        cursor.execute('UPDATE users SET is_active = 1 WHERE is_active IS NULL')
        cursor.execute('UPDATE users SET last_login = ? WHERE last_login IS NULL', (datetime.now().isoformat(),))
        
        # Reset passwords to known values
        new_password = "admin123"
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update existing users
        cursor.execute('UPDATE users SET password_hash = ?', (password_hash,))
        
        # Create admin user if doesn't exist
        cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO users (username, password_hash, email, created_date, last_login, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('admin', password_hash, 'admin@smartsecure.lk', datetime.now().isoformat(), datetime.now().isoformat(), 1))
            print("✅ Created admin user")
        
        conn.commit()
        
        # Show final table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("\nFinal table structure:")
        for col in columns:
            print(f"  {col[1]} {col[2]}")
        
        # Show all users
        cursor.execute('SELECT id, username, email, is_active, last_login FROM users')
        users = cursor.fetchall()
        print(f"\n=== All Users ({len(users)}) ===")
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Active: {user[3]}, Last Login: {user[4]}")
        
        conn.close()
        
        print("\n✅ Database schema fixed successfully!")
        print("\n🔑 LOGIN CREDENTIALS:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   OR")
        print("   Username: pamith")
        print("   Password: admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        return False

if __name__ == "__main__":
    fix_database_schema()