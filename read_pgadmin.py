import sqlite3
import os

db_path = os.path.expandvars(r'%APPDATA%\pgadmin\pgadmin4.db')

if not os.path.exists(db_path):
    print(f"pgAdmin database not found at: {db_path}")
    exit(1)

print(f"Reading pgAdmin database at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT name, host, port, username, password FROM server")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} saved servers:")
    for row in rows:
        print(f"Name: {row[0]}, Host: {row[1]}, Port: {row[2]}, User: {row[3]}, Password (encrypted): {row[4] is not None}")
except Exception as e:
    print("Error querying database:", str(e))
finally:
    conn.close()
