from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_db, get_current_user
from app.db.repositories.analytics_repo import AnalyticsRepository
from app.db.repositories.profile_repo import ProfileRepository
from datetime import datetime
from app.domain.analytics.engine import AnalyticsEngine
from uuid import uuid4
from typing import List, Dict


router = APIRouter()


def _compute_grade(score: int) -> str:
    if score >= 900:
        return "A+"
    if score >= 800:
        return "A"
    if score >= 700:
        return "B+"
    if score >= 600:
        return "B"
    if score >= 500:
        return "C"
    if score >= 400:
        return "D"
    return "F"


def _clamp(v, lo=0.0, hi=100.0):
    try:
        f = float(v)
    except Exception:
        return lo
    if f != f:
        return lo
    return max(lo, min(hi, f))


@router.get("/me/latest")
async def get_latest_dashboard(db=Depends(get_db), user=Depends(get_current_user)):
    repo = AnalyticsRepository(db)
    state = await repo.get_latest_by_user(user.id)

    # If no persisted analytics snapshot exists, attempt to synthesize one from
    # the user's latest financial profile so the frontend shows sensible values
    if not state:
        profile_repo = ProfileRepository(db)
        profile = await profile_repo.get_by_user_id(user.id)
        if profile and getattr(profile, "features", None):
            engine = AnalyticsEngine()
            # produce a transient analytics mapping (not persisted)
            state = engine.create_analytics_state(str(user.id), str(profile.id), profile.features)
        else:
            # no profile or analytics — return a public-like empty payload
            return {
                "score": 0,
                "grade": "F",
                "percentile": 0,
                "delta": 0,
                "income": 0,
                "savings_rate": 0,
                "goals_active": 0,
                "goals_total": 0,
                "breakdown": [],
                "insights": [],
                "trend": [],
                "recommendations": [],
                "timeline": [],
            }

    # support both ORM objects (attributes) and plain mappings
    if hasattr(state, "metrics"):
        metrics = state.metrics or {}
        scores = state.scores or {}
    else:
        metrics = (state or {}).get("metrics", {})
        scores = (state or {}).get("scores", {})

    overall = float(scores.get("overall_health", 0.0))
    score = int(round(overall * 10))
    grade = _compute_grade(score)

    # history for delta and trend (latest first)
    history = await repo.get_history(user.id, limit=6)
    prev_score = None
    if len(history) >= 2:
        prev = history[1]
        prev_score = int(round(float((prev.scores or {}).get("overall_health", 0.0)) * 10))
    delta = score - (prev_score or score)

    percentile = int(_clamp(score / 10.0, 0.0, 100.0))

    # profile for income and goals
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(user.id)
    income = 0
    if profile and profile.features:
        income = profile.features.get("monthly_income") or profile.features.get("income") or 0
    if not income:
        disp = metrics.get("disposable_income") or 0
        est_exp = metrics.get("estimated_monthly_expenses") or 0
        income = int(disp + est_exp) if (disp or est_exp) else 0

    savings_rate = metrics.get("savings_rate") or 0

    # expense ratio (percent of income consumed by expenses)
    expense_ratio = 0
    try:
        est_exp = float(metrics.get("estimated_monthly_expenses", 0) or 0)
        inc = float(income or 0)
        if inc > 0:
            expense_ratio = round((est_exp / inc) * 100.0, 2)
    except Exception:
        expense_ratio = 0

    # breakdown mapping (convert internal metrics into 0-100 goodness values)
    pressure = metrics.get("pressure_score", 100.0)
    income_stability = _clamp(100.0 - float(pressure))
    dti = metrics.get("debt_to_income_ratio", 999.0)
    debt_mgmt = _clamp(100.0 - (float(dti) * 100.0)) if dti != 999.0 else 0.0

    breakdown = [
        {"dimension": "Income Stability", "value": income_stability},
        {"dimension": "Savings Rate", "value": _clamp(savings_rate)},
        {"dimension": "Debt Management", "value": debt_mgmt},
        {"dimension": "Investments", "value": _clamp(metrics.get("investment_score", 0.0))},
        {"dimension": "Emergency Fund", "value": _clamp(metrics.get("financial_stability_score", 0.0))},
        {"dimension": "Banking Behavior", "value": _clamp((metrics.get("rent_burden_ratio") or 0) * 100.0)},
    ]

    # trend (oldest->newest for frontend charts)
    trend = []
    for s in reversed(history):
        ts = getattr(s, "created_at", None)
        month = ts.strftime("%b") if ts else ""
        s_score = int(round(float((s.scores or {}).get("overall_health", 0.0)) * 10))
        trend.append({"month": month, "score": s_score})

    # timeline (recent events)
    timeline = []
    for s in history[:5]:
        ts = getattr(s, "created_at", None)
        timeline.append({
            "id": s.id,
            "date": ts.isoformat() if ts else None,
            "type": "Score Update",
            "description": f"Snapshot taken with score {int(round(float((s.scores or {}).get('overall_health', 0.0)) * 10))}",
            "impact": int(round(float((s.scores or {}).get("overall_health", 0.0)) * 10)),
        })

    payload = {
        "score": score,
        "grade": grade,
        "percentile": percentile,
        "delta": delta,
        "income": int(income) if isinstance(income, (int, float)) else income,
        "savings_rate": round(float(savings_rate), 1) if isinstance(savings_rate, (int, float)) else savings_rate,
        "expense_ratio": expense_ratio,
        "expense_breakdown": metrics.get("expense_breakdown") or [],
        "goals_active": 0,
        "goals_total": 0,
        "breakdown": breakdown,
        "insights": [],
        "trend": trend,
        "recommendations": [],
        "timeline": timeline,
    }

    # Derive simple deterministic insights from metrics/features so the frontend shows personalized hints
    try:
        insights = []
        er = float(payload.get("expense_ratio") or 0)
        sr = float(payload.get("savings_rate") or 0)
        eb = payload.get("expense_breakdown") or {}

        if er >= 70:
            insights.append({"id": str(uuid4()), "category": "Expenses", "title": "High expense ratio", "body": f"Your expenses are {er}% of your income — consider reducing discretionary spending."})
        elif er >= 50:
            insights.append({"id": str(uuid4()), "category": "Expenses", "title": "Moderate expense ratio", "body": f"Your expenses are {er}% of income. Small savings can improve your score."})

        if sr <= 10:
            insights.append({"id": str(uuid4()), "category": "Savings", "title": "Low savings rate", "body": f"Your current savings rate is only {sr}%. Aim for at least 20% to build resilience."})
        elif sr >= 20:
            insights.append({"id": str(uuid4()), "category": "Savings", "title": "Healthy savings rate", "body": f"Great — your savings rate of {sr}% is on track."})

        # Quick callouts from expense breakdown
        if isinstance(eb, dict):
            # find top category
            top = max(eb.items(), key=lambda x: x[1]) if eb else None
            if top:
                insights.append({"id": str(uuid4()), "category": "Spending", "title": f"High spend: {top[0]}", "body": f"You spend about ₦{int(top[1]):,} on {top[0]}. Consider cheaper alternatives."})

        payload["insights"] = insights
    except Exception:
        payload["insights"] = payload.get("insights", [])

    return payload


@router.get("")
async def get_dashboard_no_slash(db=Depends(get_db), user=Depends(get_current_user)):
    """Alias for `/api/v1/dashboard` (no trailing slash) used by the frontend.
    This proxies to the authenticated latest dashboard payload.
    """
    return await get_latest_dashboard(db=db, user=user)


@router.get("")
async def get_dashboard_root(db=Depends(get_db), user=Depends(get_current_user)):
    """Convenience route matching `/api/v1/dashboard` (no trailing slash).
    Frontend calls `/api/v1/dashboard` so provide the same payload as
    `/api/v1/dashboard/me/latest` when authenticated.
    """
    return await get_latest_dashboard(db=db, user=user)


@router.get("/", summary="Public sample dashboard")
async def public_dashboard_demo():
    # Simple demo payload compatible with the frontend shape
    now = datetime.utcnow()
    payload = {
        "score": 742,
        "grade": "B+",
        "percentile": 73,
        "delta": 12,
        "income": 200000,
        "savings_rate": 30,
        "goals_active": 2,
        "goals_total": 5,
        "breakdown": [
            {"dimension": "Income Stability", "value": 82},
            {"dimension": "Savings Rate", "value": 68},
            {"dimension": "Debt Management", "value": 75},
            {"dimension": "Investments", "value": 54},
            {"dimension": "Emergency Fund", "value": 71},
            {"dimension": "Banking Behavior", "value": 88},
        ],
        "insights": [],
        "trend": [],
        "recommendations": [],
        "timeline": [],
        "generated_at": now.isoformat(),
    }
    return payload
