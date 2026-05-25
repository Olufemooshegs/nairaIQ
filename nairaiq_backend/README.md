NairaIQ Backend

Phase 1 & 2 scaffold for the NairaIQ fintech backend.

Run instructions (development):

1. Create a Python 3.12+ virtualenv and activate it.
2. pip install -r requirements.txt
3. Copy `.env.example` to `.env` and update values.
4. Run migrations: `alembic upgrade head` (ensure `DATABASE_URL` set)
5. Start app: `uvicorn app.main:app --reload`
