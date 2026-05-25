import os
import subprocess
import sys


def pytest_sessionstart(session):
    """Ensure Alembic migrations are applied before running tests.

    This runs `alembic upgrade head` in the `nairaiq_backend` working
    directory. If migrations fail or the DB is not reachable, abort tests
    early so the failure is visible and actionable.
    """
    cmd = ["alembic", "upgrade", "head"]
    env = os.environ.copy()
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, env=env)
        if res.returncode != 0:
            print("Alembic migration failed:\n", res.stdout, res.stderr, file=sys.stderr)
            raise RuntimeError("Alembic migrations failed; aborting tests")
    except FileNotFoundError:
        print("Alembic executable not found. Ensure alembic is installed.", file=sys.stderr)
        raise