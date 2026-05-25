from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from app.config import settings


# In CI (GitHub Actions) prefer the local Postgres service we start in the workflow.
# This avoids accidentally using any external DATABASE_URL that may be present
# in repository secrets or the runner environment and that isn't reachable from
# the Actions runner.
if os.getenv("GITHUB_ACTIONS") == "true":
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/test_db")
else:
    DATABASE_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
