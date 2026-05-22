from app.domain.features.extractor import FeatureExtractor


def test_vectorize():
    class DummyInput:
        def dict(self):
            return {"monthly_income": 50000, "monthly_expenses": 20000, "savings_balance": 0, "income_stability": "low"}

    extractor = FeatureExtractor()
    features = extractor.extract(DummyInput())
    vector = extractor.vectorize(features)
    assert isinstance(vector, list)
    assert len(vector) == 12
    assert all(v in (0, 1) for v in vector), "All vector values must be binary (0 or 1)"


def test_feature_names_aligned():
    from app.domain.features.extractor import FeatureExtractor

    assert len(FeatureExtractor.FEATURE_NAMES) == 12
