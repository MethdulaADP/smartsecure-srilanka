#!/usr/bin/env python3
"""
Database initialization script for SmartSecure Sri Lanka
"""

import sqlite3
import bcrypt
import os
from datetime import datetime

def create_database():
    # Remove existing database
    if os.path.exists('smartsecure.db'):
        os.remove('smartsecure.db')
        print("🗑️ Removed existing database")
    
    # Create new database
    conn = sqlite3.connect('smartsecure.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT NOT NULL,
            created_date TEXT NOT NULL,
            last_login TEXT,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    # Create files table
    cursor.execute('''
        CREATE TABLE files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            secure_filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            username TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            file_size INTEGER,
            file_path TEXT NOT NULL,
            is_safe BOOLEAN DEFAULT 1,
            threat_score REAL DEFAULT 0.0,
            scan_status TEXT DEFAULT 'pending'
        )
    ''')
    
    # Create audit_logs table
    cursor.execute('''
        CREATE TABLE audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT
        )
    ''')
    
    # Create security_alerts table
    cursor.execute('''
        CREATE TABLE security_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            resolved BOOLEAN DEFAULT 0
        )
    ''')
    
    # Create default users
    users = [
        ('admin', 'admin123', 'admin@smartsecure.lk'),
        ('pamith', 'admin123', 'pamith@smartsecure.lk')
    ]
    
    for username, password, email in users:
        # Hash the password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, created_date, is_active)
            VALUES (?, ?, ?, ?, 1)
        ''', (username, password_hash, email, datetime.now().isoformat()))
        
        print(f"✅ Created user: {username}")
    
    # Create uploads directory
    os.makedirs('uploads', exist_ok=True)
    print("📁 Created uploads directory")
    
    conn.commit()
    conn.close()
    
    print("🎉 Database initialized successfully!")
    print("\n🔐 LOGIN CREDENTIALS:")
    print("   Username: admin | Password: admin123")
    print("   Username: pamith | Password: admin123")

if __name__ == "__main__":
    create_database()