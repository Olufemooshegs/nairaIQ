# NairaIQ — Codebase Snapshot (current)

Generated: 2026-05-22 — this snapshot reflects the codebase after the recent audit fixes and rewrites (requirements, Pydantic v2 settings, onboarding auth enforcement, 12-feature extractor, pressure scoring, profile versioning, repository updates, and test adjustments).

This file documents the focused project tree, the key changes made, and representative code excerpts that match the code currently in the workspace.

## Key changes applied
- `requirements.txt`: added `pydantic-settings>=2.0` to support Pydantic v2 settings API.
- `app/config.py`: moved `BaseSettings` import to `pydantic_settings` and load settings from `.env`.
- `app/schemas/onboarding.py`: removed `user_id` field — user identity now comes solely from JWT via `get_current_user`.
- `app/schemas/profile.py`: switched to Pydantic v2 output style with `model_config = ConfigDict(from_attributes=True)`.
- `app/api/v1/onboarding.py`: endpoint requires authentication (`get_current_user`) and passes `user.id` into `ProfileEngine.process()`.
- `app/api/v1/profile.py`: uses Pydantic v2 `model_validate()` to return profile DTOs.
- `app/domain/features/extractor.py`: deterministic extraction with `FEATURE_NAMES` (12 entries) and `vectorize()` returns exactly 12 binary integers.
- `app/domain/profile/scoring.py`: new `compute_pressure_score()` accumulating rule scores into `pressure_score`, `pressure_label`, `overall`, and `breakdown`.
- `app/domain/profile/engine.py`: `process(onboarding_input, user_id)` persists onboarding with explicit `user_id`, computes features, evaluates rules, computes scoring, deactivates prior profiles, and creates a new active profile; it removes the `raw` key before persisting features to JSONB.
- `app/db/models.py`: `OnboardingInput.user_id` made non-nullable; `FinancialProfile` gained `is_active` boolean for versioning.
- `app/db/repositories/profile_repo.py`: added `deactivate_prior_profiles(user_id)` and `get_by_user_id()` now filters `is_active == True`.
- `alembic/versions/0002_add_is_active_to_profiles.py`: new migration to add `is_active` with server_default true.
- `app/tests/unit/` updates: `test_feature_vector.py` now asserts 12 binary features; `test_profile_engine.py` includes employment_status in inputs and a `test_pressure_score_output`.
- `app/domain/features/registry.py`: documented stub with type hints for future extractor/vectorizer registration.

## Focused file tree (current)

- requirements.txt
- .env
- alembic/
  - env.py
  - versions/
    - 0001_initial.py
    - 0002_add_is_active_to_profiles.py
- app/
  - main.py
  - config.py
  - api/v1/
    - auth.py
    - onboarding.py
    - profile.py
  - core/
    - security.py
    - dependencies.py
  - db/
    - session.py
    - models.py
    - repositories/
      - user_repo.py
      - onboarding_repo.py
      - profile_repo.py
  - domain/
    - knowledge/
      - nigerian_context.py
    - features/
      - extractor.py
      - registry.py
    - profile/
      - evaluator.py
      - engine.py
      - rules.py
      - scoring.py
  - schemas/
    - onboarding.py
    - profile.py
  - services/
    - auth_service.py
  - tests/
    - unit/
      - test_feature_vector.py
      - test_profile_engine.py
    - integration/
      - test_onboarding_flow.py
      - test_auth_flow.py

---

## Representative updated snippets

### `requirements.txt` (now includes Pydantic settings)

```text
fastapi>=0.95
uvicorn[standard]>=0.23
SQLAlchemy>=2.0
alembic>=1.11
asyncpg>=0.27
pydantic>=2.3
pydantic-settings>=2.0
python-jose>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt>=4.0
pytest>=7.0
pytest-asyncio>=0.21
psycopg[binary]>=3.2
python-dotenv>=1.0
```

### `app/config.py`

```py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
```

### `app/schemas/onboarding.py`

```py
from pydantic import BaseModel


class OnboardingInput(BaseModel):
    monthly_income: float
    monthly_expenses: float
    savings_balance: float = 0.0
    income_stability: str = "low"  # low|medium|high
    employment_status: str | None = None
```

### `app/schemas/profile.py` (Pydantic v2)

```py
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class FinancialProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None
```

### `app/api/v1/onboarding.py` (auth enforced)

```py
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.schemas.onboarding import OnboardingInput
from app.domain.profile.engine import ProfileEngine

router = APIRouter()


@router.post("/", status_code=201)
async def onboarding(input: OnboardingInput, db=Depends(get_db), user=Depends(get_current_user)):
    engine = ProfileEngine(db)
    profile = await engine.process(input, user_id=user.id)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile generation failed")
    return {"profile_id": str(profile.id)}
```

### `app/api/v1/profile.py` (Pydantic v2 response)

```py
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.profile_repo import ProfileRepository
from app.schemas.profile import FinancialProfileOut

router = APIRouter()


@router.get("/me", response_model=FinancialProfileOut)
async def get_profile(db=Depends(get_db), user=Depends(get_current_user)):
    repo = ProfileRepository(db)
    profile = await repo.get_by_user_id(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return FinancialProfileOut.model_validate(profile)
```

### `app/domain/features/extractor.py` (12 binary features)

```py
from typing import Any
from app.domain.knowledge.nigerian_context import NigerianContext


class FeatureExtractor:
    FEATURE_NAMES = [
        "has_savings",
        "income_stable",
        "above_min_wage",
        "positive_cash_flow",
        "has_employment",
        "savings_rate_adequate",
        "low_expense_ratio",
        "high_income_tier",
        "has_emergency_buffer",
        "investment_eligible",
        "debt_pressure_low",
        "income_above_inflation",
    ]

    def __init__(self):
        self.context = NigerianContext()

    def extract(self, onboarding_input) -> dict:
        data = onboarding_input.dict()
        income = float(data.get("monthly_income", 0) or 0)
        expenses = float(data.get("monthly_expenses", 0) or 0)
        savings = float(data.get("savings_balance", 0) or 0)
        income_stability = data.get("income_stability", "low")
        employment_status = data.get("employment_status")

        expense_ratio = (expenses / income) if income > 0 else 1.0
        savings_rate = ((income - expenses) / income) if income > 0 else 0.0

        features = {
            "monthly_income": income,
            "monthly_expenses": expenses,
            "savings_balance": savings,
            "income_stability": income_stability,
            "employment_status": employment_status,
            "expense_ratio": expense_ratio,
            "savings_rate": savings_rate,
            "has_savings": savings > 0,
            "income_stable": income_stability == "high",
            "above_min_wage": income >= self.context.MIN_WAGE,
            "positive_cash_flow": income > expenses,
            "has_employment": employment_status is not None and (str(employment_status).lower() != "unemployed"),
            "savings_rate_adequate": (savings_rate >= 0.20) if income > 0 else False,
            "low_expense_ratio": (expense_ratio <= 0.60) if income > 0 else False,
            "high_income_tier": income >= 300_000,
            "has_emergency_buffer": savings >= (expenses * 3),
            "investment_eligible": False,
            "debt_pressure_low": (expense_ratio <= 0.50) if income > 0 else False,
            "income_above_inflation": income >= (self.context.MIN_WAGE * (1 + self.context.INFLATION_RATE)),
            "raw": data,
        }

        features["investment_eligible"] = (
            features["above_min_wage"] and features["positive_cash_flow"] and features["has_savings"]
        )

        return features

    def vectorize(self, features: dict) -> list:
        return [1 if features.get(k) else 0 for k in self.FEATURE_NAMES]
```

### `app/domain/profile/scoring.py` (pressure scoring)

```py
from typing import Dict


def compute_pressure_score(rule_results: Dict[str, dict]) -> dict:
    total_pressure = 0.0
    breakdown: Dict[str, float] = {}
    count = 0

    for name, res in rule_results.items():
        raw = res.get("score", 0)
        try:
            s = float(raw)
        except Exception:
            s = 0.0
        breakdown[name] = s
        if s > 0:
            total_pressure += s
        count += 1

    pressure_score = int(round(total_pressure))

    if pressure_score <= 2:
        label = "low"
    elif 3 <= pressure_score <= 4:
        label = "medium"
    elif 5 <= pressure_score <= 6:
        label = "high"
    else:
        label = "critical"

    overall = (sum(breakdown.values()) / float(count)) if count > 0 else 0.0

    return {
        "pressure_score": pressure_score,
        "pressure_label": label,
        "overall": round(float(overall), 4),
        "breakdown": breakdown,
    }
```

### `app/domain/profile/engine.py` (persist with user_id; remove `raw`)

```py
    async def process(self, onboarding_input, user_id):
        onboarding_repo = OnboardingRepository(self.db)
        try:
            payload = onboarding_input.dict()
            payload["user_id"] = user_id
            await onboarding_repo.create(payload)
        except Exception:
            pass

        features = self.extractor.extract(onboarding_input)
        rules_result = self.evaluator.evaluate(features)
        scoring = compute_pressure_score(rules_result)
        vector = self.extractor.vectorize(features)

        try:
            await self.repo.deactivate_prior_profiles(user_id)
        except Exception:
            pass

        features_to_store = dict(features)
        features_to_store.pop("raw", None)

        profile = await self.repo.create({
            "id": uuid4(),
            "user_id": user_id,
            "features": features_to_store,
            "vector": vector,
            "scores": scoring,
        })

        await self.db.commit()
        return profile
```

### `app/db/models.py` (OnboardingInput and FinancialProfile)

```py
class OnboardingInput(Base):
    __tablename__ = "onboarding_inputs"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    payload = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    features = Column(JSONB, nullable=False)
    vector = Column(JSONB, nullable=False)
    scores = Column(JSONB, nullable=False)
    meta = Column(JSONB)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

### Alembic migration: `alembic/versions/0002_add_is_active_to_profiles.py`

```py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('financial_profiles', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')))

def downgrade():
    op.drop_column('financial_profiles', 'is_active')
```

### `app/db/repositories/profile_repo.py` (key methods)

```py
    async def deactivate_prior_profiles(self, user_id: UUID) -> None:
        stmt = (
            update(FinancialProfile)
            .where(FinancialProfile.user_id == user_id, FinancialProfile.is_active == True)
            .values(is_active=False)
        )
        await self.db.execute(stmt)

    async def get_by_user_id(self, user_id):
        q = select(FinancialProfile).where(
            FinancialProfile.user_id == user_id,
            FinancialProfile.is_active == True,
        )
        res = await self.db.execute(q)
        return res.scalars().first()
```

### Tests updated

`app/tests/unit/test_feature_vector.py` now verifies the 12-element binary vector and `FEATURE_NAMES` alignment.

`app/tests/unit/test_profile_engine.py` includes `employment_status` in inputs and a `test_pressure_score_output` to validate scoring output shape.

### `app/domain/features/registry.py` (documented stub)

```py
"""
Feature registry — reserve this module for registering multiple extractor or vectorizer strategies.

Example usage (future):
    register_extractor("v1", FeatureExtractorV1())
    extractor = EXTRACTORS["v1"]

This module is intentionally simple today and provides typed registries for future extension.
"""

from typing import Callable, Dict, Any

EXTRACTORS: Dict[str, Callable[..., Any]] = {}
VECTORIZERS: Dict[str, Callable[..., Any]] = {}


def register_extractor(name: str, extractor: Callable[..., Any]) -> None:
    EXTRACTORS[name] = extractor


def register_vectorizer(name: str, vectorizer: Callable[..., Any]) -> None:
    VECTORIZERS[name] = vectorizer
```

---

## How to apply database changes (after ensuring DB reachable and env vars set)

```powershell
pip install pydantic-settings
alembic upgrade head
```

---

This snapshot matches the repository state: the listed files and snippets are the current implementations after the audit and rewrites. If you want, I can produce a PDF export of this snapshot next.

End of snapshot.
# tests package
```

---

### File: app/tests/unit/test_rule_evaluator.py
- Summary: Unit test ensuring rules are registered.

```py
from app.domain.profile.rules import Rule, RULES


def test_rules_registered():
    assert len(RULES) >= 1
    names = [r.name for r in RULES]
    assert "savings_capacity" in names
```

---

### File: app/tests/unit/test_profile_engine.py
- Summary: Unit tests for feature extraction and rule evaluator.

```py
import pytest
from app.domain.features.extractor import FeatureExtractor
from app.domain.profile.evaluator import RuleEvaluator
from app.domain.knowledge.nigerian_context import NigerianContext


def test_feature_extraction():
    class DummyInput:
        def dict(self):
            return {"monthly_income": 100000, "monthly_expenses": 30000, "savings_balance": 50000, "income_stability": "high"}

    extractor = FeatureExtractor()
    features = extractor.extract(DummyInput())
    assert features["monthly_income"] == 100000
    assert features["has_savings"] is True


def test_rule_evaluator():
    features = {"monthly_income": 100000, "monthly_expenses": 30000, "has_savings": True, "income_stable": True}
    evaluator = RuleEvaluator(NigerianContext())
    results = evaluator.evaluate(features)
    assert "savings_capacity" in results
    assert "investment_readiness" in results
```

---

### File: app/tests/unit/test_feature_vector.py
- Summary: Unit test for vectorization.

```py
from app.domain.features.extractor import FeatureExtractor


def test_vectorize():
    class DummyInput:
        def dict(self):
            return {"monthly_income": 50000, "monthly_expenses": 20000, "savings_balance": 0, "income_stability": "low"}

    extractor = FeatureExtractor()
    features = extractor.extract(DummyInput())
    vector = extractor.vectorize(features)
    assert isinstance(vector, list)
    assert len(vector) == 4
```

---

### File: app/tests/integration/test_onboarding_flow.py
- Summary: Integration smoke test for the onboarding endpoint (allows multiple acceptable status codes).

```py
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_onboarding_endpoint(tmp_path):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"monthly_income":50000,"monthly_expenses":20000,"savings_balance":10000,"income_stability":"high"}
        resp = await ac.post("/api/v1/onboarding/", json=payload)
        assert resp.status_code in (200,201,400,401)
```

---

### File: app/tests/integration/test_auth_flow.py
- Summary: Integration smoke test for register/login flow.

```py
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register_and_login(tmp_path):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/register", json={"email":"test@example.com","password":"secret"})
        assert resp.status_code in (200, 201)
```

---

### File: app/services/__init__.py
- Summary: Re-exports auth service functions.

```py
from .auth_service import register_user, authenticate_user, create_access_token_for_user
```

---

### File: app/services/auth_service.py
- Summary: User registration, authentication and token creation using repository and security helpers.

```py
from app.db.repositories.user_repo import UserRepository
from app.core import security
from app.db.models import User
import uuid


async def register_user(db, user_create):
    repo = UserRepository(db)
    existing = await repo.get_by_email(user_create.email)
    if existing:
        return None
    hashed = security.hash_password(user_create.password)
    user = User(id=uuid.uuid4(), email=user_create.email, hashed_password=hashed)
    await repo.create(user)
    await db.commit()
    return user


async def authenticate_user(db, email: str, password: str):
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user


async def create_access_token_for_user(user: User):
    token = security.create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}
```

---

### File: app/schemas/__init__.py
- Summary: Schema re-exports for convenience.

```py
from .auth import UserCreate, Token
from .onboarding import OnboardingInput
from .profile import FinancialProfileOut
```

---

### File: app/schemas/profile.py
- Summary: Pydantic output schema for `FinancialProfile`.

```py
from pydantic import BaseModel
from typing import Any
from uuid import UUID


class FinancialProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None

    class Config:
        orm_mode = True
```

---

### File: app/schemas/onboarding.py
- Summary: Pydantic model for onboarding input payload.

```py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class OnboardingInput(BaseModel):
    user_id: Optional[UUID]
    monthly_income: float
    monthly_expenses: float
    savings_balance: float = 0
    income_stability: str = "low"  # low|medium|high
    employment_status: str | None = None
```

---

### File: app/schemas/auth.py
- Summary: Auth request/response schemas.

```py
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

### File: app/main.py
- Summary: Creates and exposes the FastAPI application with routes mounted.

```py
from fastapi import FastAPI
from app.api.v1 import auth, onboarding, profile


def create_app() -> FastAPI:
    app = FastAPI(title="NairaIQ Backend")

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["onboarding"])
    app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])

    return app


app = create_app()
```

---

### File: .env.example
- Summary: Example environment variables (template).

```env
DATABASE_URL=postgresql+asyncpg://nairaiq:password@localhost:5432/nairaiq_db
SECRET_KEY=242242252678911
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
```

---

### File: app/config.py
- Summary: Pydantic `Settings` class loading from `.env`.

```py
from pydantic import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
```

---

### File: app/api/v1/__init__.py
- Summary: API subpackage imports.

```py
from . import auth, onboarding, profile
```

---

### File: app/api/v1/profile.py
- Summary: `GET /me` endpoint returning the caller's `FinancialProfile`.

```py
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.profile_repo import ProfileRepository
from app.schemas.profile import FinancialProfileOut

router = APIRouter()


@router.get("/me", response_model=FinancialProfileOut)
async def get_profile(db=Depends(get_db), user=Depends(get_current_user)):
    repo = ProfileRepository(db)
    profile = await repo.get_by_user_id(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return FinancialProfileOut.from_orm(profile)
```

---

### File: app/api/v1/onboarding.py
- Summary: `POST /` onboarding endpoint that invokes `ProfileEngine`.

```py
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db
from app.schemas.onboarding import OnboardingInput
from app.domain.profile.engine import ProfileEngine

router = APIRouter()


@router.post("/", status_code=201)
async def onboarding(input: OnboardingInput, db=Depends(get_db)):
    engine = ProfileEngine(db)
    profile = await engine.process(input)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile generation failed")
    return {"profile_id": str(profile.id)}
```

---

### File: app/api/v1/auth.py
- Summary: Authentication routes: register and login.

```py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services import register_user, authenticate_user, create_access_token_for_user
from app.core.dependencies import get_db
from app.schemas.auth import UserCreate, Token

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db=Depends(get_db)):
    user = await register_user(db, user_in)
    if not user:
        raise HTTPException(status_code=400, detail="Registration failed")
    token = await create_access_token_for_user(user)
    return token


@router.post("/login", response_model=Token)
async def login(form_data: UserCreate, db=Depends(get_db)):
    user = await authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = await create_access_token_for_user(user)
    return token
```

---

### File: alembic.ini
- Summary: Alembic config (logging + placeholder DB URL).

```ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql+psycopg://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers = console
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers = console
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
```

---

### File: app/domain/profile/__init__.py
- Summary: Re-exports `ProfileEngine` and `Rule` registry.

```py
from .engine import ProfileEngine
from .rules import Rule, RULES
```

---

### File: app/domain/profile/scoring.py
- Summary: Computes a simple overall score from rule results.

```py
def compute_overall_score(rule_results: dict) -> dict:
    # simple weighted average placeholder
    total = 0
    count = 0
    for r in rule_results.values():
        s = r.get("score", 0)
        total += s
        count += 1
    overall = total / max(1, count)
    return {"overall": round(overall, 4)}
```

---

### File: app/domain/profile/rules.py
- Summary: `Rule` dataclass and sample deterministic rules: `savings_capacity`, `investment_readiness`.

```py
from dataclasses import dataclass
from typing import Callable, Any


@dataclass
class Rule:
    name: str
    description: str
    evaluate_fn: Callable[[dict, Any], dict]

    def evaluate(self, features: dict, context: Any) -> dict:
        return self.evaluate_fn(features, context)


# Example rules; real rules are more complex and deterministic

def _savings_capacity_rule(features, context):
    income = features.get("monthly_income", 0)
    expenses = features.get("monthly_expenses", 0)
    capacity = max(0, (income - expenses) / max(1, income))
    return {"score": round(min(1.0, capacity), 4)}


def _investment_readiness_rule(features, context):
    # simple deterministic rule: must have savings and stable income
    score = 0
    if features.get("has_savings") and features.get("income_stable"):
        score = 1
    return {"score": score}


RULES = [
    Rule(name="savings_capacity", description="Estimate savings capacity", evaluate_fn=_savings_capacity_rule),
    Rule(name="investment_readiness", description="Estimate investment readiness", evaluate_fn=_investment_readiness_rule),
]
```

---

### File: app/domain/profile/models.py
- Summary: Lightweight dataclass representation of a `FinancialProfile`.

```py
from dataclasses import dataclass
from uuid import UUID
from typing import Any


@dataclass
class FinancialProfile:
    id: UUID
    user_id: UUID
    features: dict
    vector: list
    scores: dict
    meta: dict | None = None
```

---

### File: app/domain/profile/evaluator.py
- Summary: `RuleEvaluator` that runs the registered rules over features.

```py
from app.domain.profile.rules import RULES


class RuleEvaluator:
    def __init__(self, context):
        self.context = context

    def evaluate(self, features: dict) -> dict:
        results = {}
        for rule in RULES:
            results[rule.name] = rule.evaluate(features, self.context)
        return results
```

---

### File: app/domain/profile/engine.py
- Summary: `ProfileEngine` orchestrates persistence of onboarding inputs, feature extraction, rule evaluation, vectorization, and profile persistence.

```py
from app.domain.profile.evaluator import RuleEvaluator
from app.domain.features.extractor import FeatureExtractor
from app.db.repositories.profile_repo import ProfileRepository
from app.domain.knowledge.nigerian_context import NigerianContext
from uuid import uuid4
from app.db.repositories.onboarding_repo import OnboardingRepository


class ProfileEngine:
    def __init__(self, db):
        self.db = db
        self.evaluator = RuleEvaluator(NigerianContext())
        self.extractor = FeatureExtractor()
        self.repo = ProfileRepository(db)

    async def process(self, onboarding_input):
        # persist onboarding input (non-blocking for evaluation)
        onboarding_repo = OnboardingRepository(self.db)
        try:
            await onboarding_repo.create(onboarding_input.dict())
        except Exception:
            # do not fail profile generation for persistence errors; surface later via logs
            pass

        features = self.extractor.extract(onboarding_input)
        rules_result = self.evaluator.evaluate(features)
        # scoring and vectorization
        vector = self.extractor.vectorize(features)

        profile = await self.repo.create({
            "id": uuid4(),
            "user_id": getattr(onboarding_input, "user_id", None),
            "features": features,
            "vector": vector,
            "scores": rules_result,
        })
        # persist
        await self.db.commit()
        return profile
```

---

### File: app/domain/knowledge/__init__.py
- Summary: Exposes `NigerianContext` from the knowledge module.

```py
from .nigerian_context import NigerianContext
```

---

### File: app/domain/knowledge/nigerian_context.py
- Summary: Domain heuristics and constants (e.g., `MIN_WAGE`) used by rules.

```py
class NigerianContext:
    """Encapsulates Nigerian-specific heuristics, constants, and lookup tables.

    This module stays pure-Python and contains deterministic rules and thresholds
    used by the RuleEvaluator. It must NOT depend on FastAPI or DB layers.
    """

    MIN_WAGE = 70000  # naive example - NGN
    INFLATION_RATE = 0.22

    def is_income_above_min_wage(self, income: float) -> bool:
        return income >= self.MIN_WAGE

    def affordability_threshold(self, income: float) -> float:
        # domain-specific affordability heuristic
        return max(0.0, min(1.0, (income - self.MIN_WAGE) / (income if income > 0 else 1)))
```

---

### File: app/db/session.py
- Summary: Async SQLAlchemy engine and `AsyncSession` factory and `get_db` dependency.

```py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

---

### File: alembic/versions/0001_initial.py
- Summary: Initial schema migration creating `users`, `onboarding_inputs`, and `financial_profiles`.

```py
"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-05-21 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'onboarding_inputs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'financial_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('features', postgresql.JSONB(), nullable=False),
        sa.Column('vector', postgresql.JSONB(), nullable=False),
        sa.Column('scores', postgresql.JSONB(), nullable=False),
        sa.Column('meta', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('financial_profiles')
    op.drop_table('onboarding_inputs')
    op.drop_table('users')
```

---

### File: alembic/env.py
- Summary: Alembic environment; converts async DSNs to sync for migrations and escapes `%` to avoid interpolation errors.

```py
from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

DATABASE_URL = os.getenv("DATABASE_URL")

def _set_sqlalchemy_url_safe(url: str):
    # ConfigParser uses '%' for interpolation which raises on raw '%' chars
    # in values. Escape '%' by doubling so ConfigParser accepts the value.
    safe = url.replace('%', '%%')
    config.set_main_option("sqlalchemy.url", safe)

if DATABASE_URL:
    # If an async DB URL is provided (asyncpg), Alembic/SQLAlchemy's
    # synchronous migration path cannot use the asyncpg driver directly.
    # Replace the asyncpg driver with a sync driver (psycopg) for migrations.
    if DATABASE_URL.startswith("postgresql+asyncpg"):
        sync_url = DATABASE_URL.replace("+asyncpg", "+psycopg")
        _set_sqlalchemy_url_safe(sync_url)
    else:
        _set_sqlalchemy_url_safe(DATABASE_URL)

from app.db.models import Base

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

### File: app/core/__init__.py
- Summary: Re-export core helpers.

```py
from .security import hash_password, verify_password, create_access_token, decode_token
from .dependencies import get_db, get_current_user
```

---

### File: app/core/security.py
- Summary: Password hashing (bcrypt) and JWT encode/decode helpers.

```py
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: int | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

---

### File: app/core/exceptions.py
- Summary: Small custom exception class.

```py
class NairaIQException(Exception):
    pass
```

---

### File: app/core/dependencies.py
- Summary: FastAPI dependencies: `get_db` (async session) and `get_current_user` (JWT bearer auth).

```py
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.db.session import get_db as get_db_session
from app.core.security import decode_token
from uuid import UUID
from app.db.repositories.user_repo import UserRepository

bearer_scheme = HTTPBearer()


async def get_db():
    async for s in get_db_session():
        yield s


async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme), db=Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id_raw = payload.get("sub")
    try:
        user_id = UUID(user_id_raw)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

---

### File: app/db/repositories/profile_repo.py
- Summary: Repository for `FinancialProfile` persistence and retrieval.

```py
from app.db.models import FinancialProfile
from sqlalchemy import select


class ProfileRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, payload: dict):
        obj = FinancialProfile(
            id=payload.get("id"),
            user_id=payload.get("user_id"),
            features=payload.get("features"),
            vector=payload.get("vector"),
            scores=payload.get("scores"),
            meta=payload.get("meta"),
        )
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def get_by_user_id(self, user_id):
        q = select(FinancialProfile).where(FinancialProfile.user_id == user_id)
        res = await self.db.execute(q)
        return res.scalars().first()
```

---

### File: app/db/repositories/onboarding_repo.py
- Summary: Repository for onboarding input persistence.

```py
from app.db.models import OnboardingInput
from sqlalchemy import select


class OnboardingRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, payload: dict):
        obj = OnboardingInput(user_id=payload.get("user_id"), payload=payload)
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def get_by_user_id(self, user_id):
        q = select(OnboardingInput).where(OnboardingInput.user_id == user_id)
        res = await self.db.execute(q)
        return res.scalars().all()
```

---

### File: app/db/models.py
- Summary: SQLAlchemy ORM models for `User`, `OnboardingInput`, and `FinancialProfile` (JSONB columns used for feature/vector/scores/meta).

```py
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OnboardingInput(Base):
    __tablename__ = "onboarding_inputs"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payload = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    features = Column(JSONB, nullable=False)
    vector = Column(JSONB, nullable=False)
    scores = Column(JSONB, nullable=False)
    meta = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

---

### File: app/db/repositories/user_repo.py
- Summary: Basic `User` repository for create and lookup by email/id.

```py
from app.db.models import User
from sqlalchemy import select


class UserRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, user: User):
        self.db.add(user)
        await self.db.flush()
        return user

    async def get_by_email(self, email: str):
        q = select(User).where(User.email == email)
        res = await self.db.execute(q)
        return res.scalars().first()

    async def get_by_id(self, id):
        q = select(User).where(User.id == id)
        res = await self.db.execute(q)
        return res.scalars().first()
```

---

### File: app/db/repositories/__init__.py
- Summary: Repository package exports.

```py
from .user_repo import UserRepository
from .onboarding_repo import OnboardingRepository
from .profile_repo import ProfileRepository
```

---

### File: app/domain/features/registry.py
- Summary: Registries for extractors and vectorizers.

```py
# registry for feature extractors and vectorizers
EXTRACTORS = {}
VECTORIZERS = {}


def register_extractor(name, extractor):
    EXTRACTORS[name] = extractor


def register_vectorizer(name, vectorizer):
    VECTORIZERS[name] = vectorizer
```

---

### File: app/domain/features/extractor.py
- Summary: Feature extraction and simple vectorization logic converting onboarding input into deterministic features and numeric vector.

```py
from typing import Any


class FeatureExtractor:
    def extract(self, onboarding_input) -> dict:
        # Convert onboarding input to feature dict
        data = onboarding_input.dict()
        # simple extraction
        features = {
            "monthly_income": data.get("monthly_income", 0),
            "monthly_expenses": data.get("monthly_expenses", 0),
            "has_savings": data.get("savings_balance", 0) > 0,
            "income_stable": data.get("income_stability", "low") == "high",
            "raw": data,
        }
        return features

    def vectorize(self, features: dict) -> list:
        # deterministic binary vector
        return [
            1 if features.get("has_savings") else 0,
            1 if features.get("income_stable") else 0,
            float(features.get("monthly_income", 0)),
            float(features.get("monthly_expenses", 0)),
        ]
```

---

### File: app/domain/features/vectorizer.py
- Summary: Small helper to wrap a vector into JSONB structure.

```py
class Vectorizer:
    def to_jsonb(self, vector: list) -> dict:
        return {"vector": vector}
```

---

### File: app/domain/features/__init__.py
- Summary: Feature module exports and registry bindings.

```py
from .extractor import FeatureExtractor
from .vectorizer import Vectorizer
from .registry import register_extractor, register_vectorizer
```

---

End of snapshot.
