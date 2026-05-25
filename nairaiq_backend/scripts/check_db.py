import sys
import os
try:
    import psycopg
except Exception as e:
    print("MISSING_PKG psycopg:", e)
    sys.exit(2)

# Default DSN (falls back to .env values if not set)
DEFAULT_DSN = "postgresql://nairaiq:password@localhost:5432/nairaiq_db"
env_dsn = os.getenv("DATABASE_URL")
if env_dsn:
    d = env_dsn
    if d.startswith("postgresql+asyncpg"):
        d = d.replace("+asyncpg", "")
    if d.startswith("postgresql+psycopg"):
        d = d.replace("+psycopg", "")
else:
    d = DEFAULT_DSN

try:
    conn = psycopg.connect(d)
    cur = conn.cursor()
    cur.execute("SELECT 1")
    print("OK", cur.fetchone())
    conn.close()
except Exception as e:
    print("ERROR", e)
    sys.exit(1)
