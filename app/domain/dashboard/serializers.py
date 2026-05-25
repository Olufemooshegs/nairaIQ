from typing import Any, Dict


def to_mapping(state: Any) -> Dict[str, Any]:
    """Convert a persisted AnalyticsState (ORM instance or mapping) into a plain mapping.

    This keeps the Dashboard layer independent of ORM details and supports
    both SQLAlchemy instances (attributes) and dict-like snapshots.
    """
    if state is None:
        return {}

    # SQLAlchemy model instance path
    if hasattr(state, "metrics") and hasattr(state, "scores"):
        return {
            "id": getattr(state, "id", None),
            "user_id": getattr(state, "user_id", None),
            "profile_id": getattr(state, "profile_id", None),
            "metrics": getattr(state, "metrics", {}) or {},
            "scores": getattr(state, "scores", {}) or {},
            "meta": getattr(state, "meta", {}) or {},
            "created_at": getattr(state, "created_at", None),
        }

    # Assume mapping-like
    return {
        "id": state.get("id"),
        "user_id": state.get("user_id"),
        "profile_id": state.get("profile_id"),
        "metrics": state.get("metrics", {}) or {},
        "scores": state.get("scores", {}) or {},
        "meta": state.get("meta", {}) or {},
        "created_at": state.get("created_at"),
    }
