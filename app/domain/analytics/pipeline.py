from typing import Dict, Any
from .engine import AnalyticsEngine


class AnalyticsPipeline:
    def __init__(self, engine: AnalyticsEngine):
        self.engine = engine

    def run(self, user_id, profile_id, features: Dict[str, Any]) -> Dict[str, Any]:
        # Clear single-entry deterministic pipeline
        state = self.engine.create_analytics_state(user_id, profile_id, features)
        return state
