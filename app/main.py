from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from app.api.v1 import auth, onboarding, profile, analytics, scoring, dashboard, history, trends


def create_app() -> FastAPI:
    app = FastAPI(title="NairaIQ Backend")

    # Configure CORS for local development. Can be overridden by
    # setting the ALLOWED_ORIGINS environment variable to a comma-separated list.
    allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
    if allowed_origins_env:
        allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    else:
        allowed_origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Simple health endpoint for quick readiness checks from the frontend/dev tooling
    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["onboarding"])
    app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
    app.include_router(scoring.router, prefix="/api/v1/scoring", tags=["scoring"])
    app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
    app.include_router(history.router, prefix="/api/v1/history", tags=["history"])
    app.include_router(trends.router, prefix="/api/v1/trends", tags=["trends"])

    # On startup, if using a local sqlite DB, create tables automatically
    @app.on_event("startup")
    async def init_sqlite_db():
        try:
            from app.db.session import engine, DATABASE_URL
            if "sqlite" in str(DATABASE_URL):
                from app.db.models import Base
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
        except Exception:
            # If anything goes wrong creating tables in dev, don't block startup
            pass

    return app


app = create_app()

# Serve built frontend (if present) so the backend can be deployed standalone.
try:
    client_dist = Path(__file__).resolve().parent.parent / "nairaiq_frontend" / "dist" / "client"
    if client_dist.exists():
        app.mount("/", StaticFiles(directory=str(client_dist), html=True), name="frontend")
except Exception:
    pass
