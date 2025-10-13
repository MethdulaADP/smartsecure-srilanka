#!/usr/bin/env python3

import sqlite3
import bcrypt
from datetime import datetime
import os

def create_fresh_database():
    """Create a fresh database with all required tables and test users"""
    try:
        # Remove old database if exists
        if os.path.exists('smartsecure.db'):
            os.remove('smartsecure.db')
            print("🗑️ Removed old database")
        
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        print("=== Creating Fresh Database ===")
        
        # Create users table with all required columns
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_date TEXT NOT NULL,
                last_login TEXT,
                is_active INTEGER DEFAULT 1
            )
        ''')
        print("✅ Created users table")
        
        # Create files table
        cursor.execute('''
            CREATE TABLE files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                filename TEXT NOT NULL,
                secure_filename TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                upload_date TEXT NOT NULL,
                file_hash TEXT,
                mime_type TEXT,
                threat_score REAL DEFAULT 0.0,
                is_safe INTEGER DEFAULT 1,
                file_category TEXT DEFAULT 'unknown'
            )
        ''')
        print("✅ Created files table")
        
        # Create activity_logs table
        cursor.execute('''
            CREATE TABLE activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                description TEXT,
                timestamp TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT
            )
        ''')
        print("✅ Created activity_logs table")
        
        # Create security_events table
        cursor.execute('''
            CREATE TABLE security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                event_type TEXT NOT NULL,
                threat_level TEXT NOT NULL,
                description TEXT,
                timestamp TEXT NOT NULL,
                resolved INTEGER DEFAULT 0
            )
        ''')
        print("✅ Created security_events table")
        
        # Create system_metrics table
        cursor.execute('''
            CREATE TABLE system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                recorded_at TEXT NOT NULL
            )
        ''')
        print("✅ Created system_metrics table")
        
        # Create test users with known passwords
        password = "admin123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        current_time = datetime.now().isoformat()
        
        # Create admin user
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, created_date, last_login, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin', password_hash, 'admin@smartsecure.lk', current_time, current_time, 1))
        
        # Create pamith user
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, created_date, last_login, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('pamith', password_hash, 'athukoralapamith@gmail.com', current_time, current_time, 1))
        
        print("✅ Created test users")
        
        conn.commit()
        
        # Verify users
        cursor.execute('SELECT id, username, email, is_active FROM users')
        users = cursor.fetchall()
        print(f"\n=== Created Users ({len(users)}) ===")
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Active: {user[3]}")
        
        conn.close()
        
        print("\n✅ Fresh database created successfully!")
        print("\n🔑 LOGIN CREDENTIALS:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   OR")
        print("   Username: pamith")
        print("   Password: admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

if __name__ == "__main__":
    create_fresh_database()