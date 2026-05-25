from app.domain.profile.rules import RULES


class RuleEvaluator:
    def __init__(self, context):
        self.context = context

    def evaluate(self, features: dict) -> dict:
        results = {}
        for rule in RULES:
            results[rule.name] = rule.evaluate(features, self.context)
        return results
