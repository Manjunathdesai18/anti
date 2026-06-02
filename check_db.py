import sqlite3
conn = sqlite3.connect('deepfake.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tables:", tables)
for t in tables:
    cur.execute(f"PRAGMA table_info({t[0]})")
    print(f"\n{t[0]} columns:", cur.fetchall())
conn.close()
