from typing import Any, Dict


class DashboardBuilder:
    """Transforms persisted AnalyticsState into a frontend-ready dashboard payload.

    Keep this deterministic and side-effect free. Accept either a SQLAlchemy
    `AnalyticsState` instance (with attributes) or a mapping.
    """

    def _as_mapping(self, state) -> Dict[str, Any]:
        if hasattr(state, "metrics"):
            return {
                "id": state.id,
                "profile_id": state.profile_id,
                "metrics": state.metrics,
                "scores": state.scores,
                "meta": state.meta,
                "created_at": getattr(state, "created_at", None),
            }
        # assume mapping-like
        return state

    def build(self, state) -> Dict[str, Any]:
        m = self._as_mapping(state)
        metrics = m.get("metrics", {})
        scores = m.get("scores", {})

        summary = {
            "overall_health": scores.get("overall_health"),
            "high_level": {
                "disposable_income": metrics.get("disposable_income"),
                "savings_rate": metrics.get("savings_rate"),
            },
        }

        payload = {
            "profile_id": m.get("profile_id"),
            "summary": summary,
            "metrics": metrics,
        }

        return payload

    def build_timeline(self, states: list) -> list:
        timeline = []
        for idx, s in enumerate(states, start=1):
            payload = self.build(s)
            entry = {
                "snapshot_id": getattr(s, "id", None),
                "profile_id": getattr(s, "profile_id", None),
                "version": idx,
                "created_at": getattr(s, "created_at", None),
                "payload": payload,
            }
            timeline.append(entry)
        return timeline
