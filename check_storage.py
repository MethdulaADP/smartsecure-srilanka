import sqlite3

conn = sqlite3.connect('backend/smartsecure.db')
cursor = conn.cursor()

# Get counts
users = cursor.execute('SELECT COUNT(*) FROM users').fetchone()[0]
files = cursor.execute('SELECT COUNT(*) FROM files').fetchone()[0]

print(f'\n=== DATABASE STATISTICS ===\n')
print(f'Users in Database: {users}')
print(f'Files in Database: {files}')

# Get user list
print(f'\n=== USERS ===')
user_list = cursor.execute('SELECT username, email, role FROM users').fetchall()
for u in user_list:
    print(f'  - {u[0]} ({u[1]}) - Role: {u[2]}')

# Get recent files
print(f'\n=== RECENT FILES (Last 10) ===')
file_list = cursor.execute('SELECT username, filename, upload_date FROM files ORDER BY upload_date DESC LIMIT 10').fetchall()
for f in file_list:
    print(f'  - {f[1]} (uploaded by: {f[0]}, date: {f[2]})')

conn.close()
