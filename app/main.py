from fastapi import FastAPI
from app.api.v1 import auth, onboarding, profile, analytics, scoring, dashboard


def create_app() -> FastAPI:
    app = FastAPI(title="NairaIQ Backend")

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["onboarding"])
    app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
    app.include_router(scoring.router, prefix="/api/v1/scoring", tags=["scoring"])
    app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])

    return app


app = create_app()
