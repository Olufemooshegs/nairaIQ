import pytest
from app.domain.features.extractor import FeatureExtractor
from app.domain.profile.evaluator import RuleEvaluator
from app.domain.knowledge.nigerian_context import NigerianContext


def test_feature_extraction():
    class DummyInput:
        def dict(self):
            return {"monthly_income": 100000, "monthly_expenses": 30000, "savings_balance": 50000, "income_stability": "high"}

    extractor = FeatureExtractor()
    features = extractor.extract(DummyInput())
    assert features["monthly_income"] == 100000
    assert features["has_savings"] is True


def test_rule_evaluator():
    features = {"monthly_income": 100000, "monthly_expenses": 30000, "has_savings": True, "income_stable": True}
    evaluator = RuleEvaluator(NigerianContext())
    results = evaluator.evaluate(features)
    assert "savings_capacity" in results
    assert "investment_readiness" in results
