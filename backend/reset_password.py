#!/usr/bin/env python3

import sqlite3
import bcrypt
from datetime import datetime

def reset_user_password():
    """Reset password for existing user"""
    try:
        conn = sqlite3.connect('smartsecure.db')
        cursor = conn.cursor()
        
        # Update pamith user with known password
        new_password = "admin123"
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute('UPDATE users SET password_hash = ? WHERE username = ?', 
                      (password_hash, 'pamith'))
        
        # Also create admin user if doesn't exist
        cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO users (username, password_hash, email, created_date, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', ('admin', password_hash, 'admin@smartsecure.lk', datetime.now().isoformat(), 1))
            print("✅ Created admin user")
        
        conn.commit()
        conn.close()
        
        print("✅ Password reset successful!")
        print("📝 Login credentials:")
        print("   Username: pamith")
        print("   Password: admin123")
        print("   OR")
        print("   Username: admin") 
        print("   Password: admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    reset_user_password()