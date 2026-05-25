from typing import List, Dict, Any
from .serializers import to_mapping
from datetime import datetime


class TimelineEngine:
    """Generate timeline data from a list of AnalyticsState snapshots.

    The engine computes series for selected metrics and returns chart-ready
    structures (e.g., list of {period, value}).
    """

    def __init__(self):
        pass

    def _period_for(self, created_at) -> str:
        if created_at is None:
            return "unknown"
        if isinstance(created_at, str):
            try:
                dt = datetime.fromisoformat(created_at)
            except Exception:
                return str(created_at)
        else:
            dt = created_at
        return f"{dt.year:04d}-{dt.month:02d}"

    def series_for_metric(self, states: List[Any], metric_key: str) -> List[Dict[str, Any]]:
        series = []
        for s in sorted(states, key=lambda x: getattr(x, "created_at", None) or s.get("created_at", None)):
            m = to_mapping(s)
            period = self._period_for(m.get("created_at"))
            val = m.get("metrics", {}).get(metric_key)
            series.append({"period": period, "value": val})
        return series

    def build_timeline(self, states: List[Any], keys: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        out = {}
        for k in keys:
            out[k] = self.series_for_metric(states, k)
        return out
