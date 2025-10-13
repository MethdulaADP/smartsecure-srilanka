import sqlite3
import hashlib
from datetime import datetime
import os

USER_TABLE = '''CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_date TEXT
)'''

ACTIVITY_TABLE = '''CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  activity_type TEXT,
  description TEXT,
  timestamp TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
)'''

FILES_TABLE = '''CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    stored_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
)'''

def get_conn(db_path):
    return sqlite3.connect(db_path)

def create_database(db_path):
    conn = get_conn(db_path)
    cur = conn.cursor()
    cur.execute(USER_TABLE)
    cur.execute(ACTIVITY_TABLE)
    cur.execute(FILES_TABLE)
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Use enhanced bcrypt hashing from security module"""
    try:
        from security import SecurityManager
        security_manager = SecurityManager(os.getenv('JWT_SECRET_KEY', 'fallback-key'))
        return security_manager.hash_password(password)
    except ImportError:
        # Fallback to SHA256 if security module not available
        return hashlib.sha256(password.encode('utf-8')).hexdigest()

def add_user(db_path, username, password, email):
    try:
        conn = get_conn(db_path)
        cur = conn.cursor()
        cur.execute('INSERT INTO users (username, password_hash, email, created_date) VALUES (?, ?, ?, ?)', (
            username, hash_password(password), email, datetime.utcnow().isoformat()
        ))
        conn.commit()
        return True, 'created'
    except sqlite3.IntegrityError:
        return False, 'username_taken'
    finally:
        conn.close()

def get_user_by_username(db_path, username):
    conn = get_conn(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {k: row[k] for k in row.keys()}

def verify_user(db_path, username, password):
    user = get_user_by_username(db_path, username)
    if not user:
        return None
    
    try:
        from security import SecurityManager
        security_manager = SecurityManager(os.getenv('JWT_SECRET_KEY', 'fallback-key'))
        
        # Try new bcrypt verification first
        if security_manager.verify_password(password, user['password_hash']):
            return user
    except ImportError:
        pass
    except:
        # Fallback to old SHA256 for existing users (migration support)
        if user['password_hash'] == hashlib.sha256(password.encode('utf-8')).hexdigest():
            # Auto-upgrade to bcrypt on successful login
            try:
                from security import SecurityManager
                security_manager = SecurityManager(os.getenv('JWT_SECRET_KEY', 'fallback-key'))
                new_hash = security_manager.hash_password(password)
                conn = get_conn(db_path)
                cur = conn.cursor()
                cur.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_hash, user['id']))
                conn.commit()
                conn.close()
            except ImportError:
                pass
            return user
    
    return None

def insert_file(db_path, user_id, filename, stored_path, file_size, uploaded_at):
        conn = get_conn(db_path)
        cur = conn.cursor()
        cur.execute('INSERT INTO files (user_id, filename, stored_path, file_size, uploaded_at) VALUES (?,?,?,?,?)',
                                (user_id, filename, stored_path, file_size, uploaded_at))
        conn.commit()
        file_id = cur.lastrowid
        conn.close()
        return file_id

def list_files(db_path, user_id):
        conn = get_conn(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT id, filename, file_size, uploaded_at FROM files WHERE user_id = ? ORDER BY uploaded_at DESC', (user_id,))
        rows = cur.fetchall()
        conn.close()
        return [ { 'id': r['id'], 'filename': r['filename'], 'file_size': r['file_size'], 'uploaded_at': r['uploaded_at'] } for r in rows ]

def analytics_for_user(db_path, user_id):
        conn = get_conn(db_path)
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*), COALESCE(SUM(file_size),0) FROM files WHERE user_id = ?', (user_id,))
        total_files, total_size = cur.fetchone()
        # Simple file type breakdown
        cur.execute("""
            SELECT 
                CASE 
                    WHEN filename LIKE '%.pdf' THEN 'PDF'
                    WHEN filename LIKE '%.png' OR filename LIKE '%.jpg' OR filename LIKE '%.jpeg' THEN 'Image'
                    WHEN filename LIKE '%.txt' OR filename LIKE '%.doc' OR filename LIKE '%.docx' THEN 'Document'
                    ELSE 'Other' END AS kind,
                COUNT(*)
            FROM files WHERE user_id = ? GROUP BY kind
        """, (user_id,))
        kinds = { kind: cnt for kind, cnt in cur.fetchall() }
        conn.close()
        return {
            'total_files': total_files,
            'total_storage': total_size,
            'by_type': kinds
        }
