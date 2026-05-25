from typing import Dict, Any, List


def aggregate_summary_from_metrics(metrics: Dict[str, Any], scores: Dict[str, Any]) -> Dict[str, Any]:
    """Create a compact summary dict from metrics and scores for dashboard headlines."""
    return {
        "headline": f"Overall health: {scores.get('overall_health')}",
        "priority_action": "Increase savings rate" if metrics.get("savings_rate", 0) < 10 else "Maintain savings",
        "financial_health": scores.get("overall_health", 0),
    }


def expense_breakdown_from_metrics(metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
    # very small placeholder: in future, expand to category-level breakdown
    return [
        {"label": "disposable_income", "value": metrics.get("disposable_income")},
        {"label": "estimated_monthly_expenses", "value": metrics.get("estimated_monthly_expenses")},
    ]
