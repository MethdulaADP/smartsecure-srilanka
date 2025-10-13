import sqlite3
from datetime import datetime

def log_activity(db_path, user_id, activity_type, description):
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute('INSERT INTO activity_logs (user_id, activity_type, description, timestamp) VALUES (?, ?, ?, ?)', (
            user_id, activity_type, description, datetime.utcnow().isoformat()
        ))
        conn.commit()
    finally:
        conn.close()
