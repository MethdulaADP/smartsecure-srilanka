#!/usr/bin/env python3
"""
Add role column to users table and set admin for admin user
"""

import sqlite3
import os

DB_PATH = 'smartsecure.db'

def add_role_column():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if role column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'role' not in columns:
            print("Adding role column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
            conn.commit()
            print("✅ Role column added")
        else:
            print("✅ Role column already exists")
        
        # Set admin role for admin user
        cursor.execute("UPDATE users SET role = 'admin' WHERE username = 'admin'")
        cursor.execute("UPDATE users SET role = 'user' WHERE username != 'admin' AND (role IS NULL OR role = '')")
        conn.commit()
        
        # Verify
        cursor.execute("SELECT username, role FROM users")
        users = cursor.fetchall()
        print("\n👥 Users and their roles:")
        for username, role in users:
            print(f"   {username}: {role}")
        
        conn.close()
        print("\n✅ Database updated successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column()
