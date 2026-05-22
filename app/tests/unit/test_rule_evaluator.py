from app.domain.profile.rules import Rule, RULES


def test_rules_registered():
    assert len(RULES) >= 1
    names = [r.name for r in RULES]
    assert "savings_capacity" in names
