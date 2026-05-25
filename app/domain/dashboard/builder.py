from typing import Any, Dict, List
from .serializers import to_mapping
from .aggregators import aggregate_summary_from_metrics, expense_breakdown_from_metrics
from .models import DashboardPayload, DashboardSummary, TimelineEntry
from datetime import datetime


class DashboardBuilder:
    """Transform AnalyticsState snapshots into frontend-ready dashboard payloads.

    The builder is the only place that formats dashboard payloads. It accepts
    either ORM instances or plain mappings (dicts) produced by persistence.
    """

    def __init__(self):
        pass

    def build(self, state: Any, timeline: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
        m = to_mapping(state)
        metrics = m.get("metrics", {})
        scores = m.get("scores", {})

        summary_map = aggregate_summary_from_metrics(metrics, scores)
        summary = DashboardSummary(
            headline=summary_map.get("headline", ""),
            priority_action=summary_map.get("priority_action", ""),
            financial_health=summary_map.get("financial_health", 0.0),
        )

        expense_breakdown = expense_breakdown_from_metrics(metrics)

        timeline_entries = timeline or []

        payload = {
            "summary": {
                "headline": summary.headline,
                "priority_action": summary.priority_action,
                "financial_health": summary.financial_health,
            },
            "scores": scores,
            "timeline": timeline_entries,
            "expense_breakdown": expense_breakdown,
            "trend_analysis": [],
            "strategic_priority": summary.priority_action,
            "generated_at": datetime.utcnow().isoformat(),
        }

        return payload
