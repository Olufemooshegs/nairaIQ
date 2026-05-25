class NigerianContext:
    """Encapsulates the Nigerian-specific heuristics, constants, and lookup tables.

    This module stays pure-Python and contains deterministic rules and thresholds
    used by the RuleEvaluator. It does NOT depend on FastAPI or DB layers.
    """

    MIN_WAGE = 70000  # naive example - NGN
    INFLATION_RATE = 0.22

    def is_income_above_min_wage(self, income: float) -> bool:
        return income >= self.MIN_WAGE

    def affordability_threshold(self, income: float) -> float:
        # domain-specific affordability heuristic
        return max(0.0, min(1.0, (income - self.MIN_WAGE) / (income if income > 0 else 1)))
