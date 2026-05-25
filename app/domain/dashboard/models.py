from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime


@dataclass
class DashboardSummary:
    headline: str
    priority_action: str
    financial_health: float


@dataclass
class TimelineEntry:
    month: str
    metrics: Dict[str, Any]


@dataclass
class DashboardPayload:
    summary: DashboardSummary
    scores: Dict[str, Any]
    timeline: List[TimelineEntry]
    expense_breakdown: List[Dict[str, Any]]
    trend_analysis: List[Dict[str, Any]]
    strategic_priority: Optional[str] = None
    generated_at: Optional[datetime] = None
