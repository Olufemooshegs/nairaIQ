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
