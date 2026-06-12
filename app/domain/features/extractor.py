import re
from typing import Any
from app.domain.knowledge.nigerian_context import NigerianContext


class FeatureExtractor:
    # Define human-readable feature names
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
        def _parse_number(s):
            if s is None:
                return 0.0
            st = str(s)
            if "-" in st:
                parts = [p for p in st.split("-")]
                nums = []
                for p in parts:
                    try:
                        nums.append(float(''.join([c for c in p if c.isdigit()] or [0])))
                    except Exception:
                        nums.append(0.0)
                if len(nums) >= 2 and nums[1] > 0:
                    return (nums[0] + nums[1]) / 2.0
                return nums[0] or nums[1] or 0.0
            if re.search(r"and above", st, re.I):
                n = ''.join([c for c in st if c.isdigit()]) or "0"
                try:
                    return float(n)
                except Exception:
                    return 0.0
            n = ''.join([c for c in st if c.isdigit()]) or "0"
            try:
                return float(n)
            except Exception:
                return 0.0

        income = float(data.get("monthly_income", 0) or 0)
        base_expenses = float(data.get("monthly_expenses", 0) or 0)
        # if category-level estimates exist, derive a more accurate expenses estimate
        cat_map = data.get("monthly_expenses_by_category")
        cat_sum = 0.0
        expense_breakdown = None
        if isinstance(cat_map, dict):
            expense_breakdown = {}
            for k, v in cat_map.items():
                try:
                    expense_breakdown[k] = _parse_number(v)
                except Exception:
                    expense_breakdown[k] = 0.0
            cat_sum = sum(expense_breakdown.values())
        expenses = cat_sum if cat_sum > 0 else base_expenses
        savings = float(data.get("savings_balance", 0) or 0)
        income_stability = data.get("income_stability", "low")
        employment_status = data.get("employment_status")

        expense_ratio = (expenses / income) if income > 0 else 1.0
        savings_rate = ((income - expenses) / income) if income > 0 else 0.0

        features = {
            "monthly_income": income,
            "monthly_expenses": expenses,
            "estimated_monthly_expenses": float(cat_sum or expenses),
            "expense_breakdown": expense_breakdown,
            "savings_balance": savings,
            "income_stability": income_stability,
            "employment_status": employment_status,
            # derived
            "expense_ratio": expense_ratio,
            "savings_rate": savings_rate,
            "has_savings": savings > 0,
            "income_stable": income_stability == "high",
            "above_min_wage": income >= self.context.MIN_WAGE,
            "positive_cash_flow": income > expenses,
            "has_employment": employment_status is not None and employment_status.lower() != "unemployed",
            "savings_rate_adequate": (savings_rate >= 0.20) if income > 0 else False,
            "low_expense_ratio": (expense_ratio <= 0.60) if income > 0 else False,
            "high_income_tier": income >= 300_000,
            "has_emergency_buffer": savings >= (expenses * 3),
            "investment_eligible": False,  # will compute below
            "debt_pressure_low": (expense_ratio <= 0.50) if income > 0 else False,
            "income_above_inflation": income >= (self.context.MIN_WAGE * (1 + self.context.INFLATION_RATE)),
            "raw": data,
        }

        features["investment_eligible"] = (
            features["above_min_wage"] and features["positive_cash_flow"] and features["has_savings"]
        )

        return features

    def vectorize(self, features: dict) -> list:
        # produce exactly 12 binary features in the order of FEATURE_NAMES
        v = []
        v.append(1 if features.get("has_savings") else 0)
        v.append(1 if features.get("income_stable") else 0)
        v.append(1 if features.get("above_min_wage") else 0)
        v.append(1 if features.get("positive_cash_flow") else 0)
        v.append(1 if features.get("has_employment") else 0)
        v.append(1 if features.get("savings_rate_adequate") else 0)
        v.append(1 if features.get("low_expense_ratio") else 0)
        v.append(1 if features.get("high_income_tier") else 0)
        v.append(1 if features.get("has_emergency_buffer") else 0)
        v.append(1 if features.get("investment_eligible") else 0)
        v.append(1 if features.get("debt_pressure_low") else 0)
        v.append(1 if features.get("income_above_inflation") else 0)

        return v
