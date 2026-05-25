from typing import Dict, Any


DEFAULTS = {
    "MINIMUM_SAFE_EMERGENCY_MONTHS": 3,
}


def compute_pressure_score(features: Dict[str, Any]) -> float:
    income = float(features.get("monthly_income", 0) or 0)
    expenses = float(features.get("monthly_expenses", 0) or 0)
    savings = float(features.get("savings_balance", 0) or 0)
    if income <= 0:
        return 100.0
    disposable = max(0.0, income - expenses)
    # normalized pressure: lower disposable -> higher pressure
    ratio = disposable / income
    score = max(0.0, 100.0 - (ratio * 100.0))
    return round(score, 2)


def compute_savings_rate(features: Dict[str, Any]) -> float:
    income = float(features.get("monthly_income", 0) or 0)
    savings = float(features.get("savings_balance", 0) or 0)
    if income <= 0:
        return 0.0
    rate = (savings / (income * 12.0)) * 100.0
    return round(rate, 2)


def compute_debt_to_income_ratio(features: Dict[str, Any]) -> float:
    income = float(features.get("monthly_income", 0) or 0)
    debt = float(features.get("monthly_debt_payments", 0) or 0)
    if income <= 0:
        return 999.0
    ratio = debt / income
    return round(ratio, 4)


def compute_emergency_fund_gap(features: Dict[str, Any]) -> float:
    income = float(features.get("monthly_income", 0) or 0)
    savings = float(features.get("savings_balance", 0) or 0)
    target_months = DEFAULTS["MINIMUM_SAFE_EMERGENCY_MONTHS"]
    target = income * target_months
    gap = max(0.0, target - savings)
    return round(gap, 2)


def compute_rent_burden_ratio(features: Dict[str, Any]) -> float:
    rent = float(features.get("monthly_rent", 0) or 0)
    income = float(features.get("monthly_income", 0) or 0)
    if income <= 0:
        return 999.0
    return round(rent / income, 4)
