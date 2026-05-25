from pydantic import ConfigDict
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    # Provide a safe default for tests/CI; production should set a real secret via env
    SECRET_KEY: str = os.getenv("SECRET_KEY", "test-secret")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None


settings = Settings()
