"""
Feature registry — reserved for future multi-extractor and multi-vectorizer support.

When multiple extractor strategies are needed (e.g. onboarding v1 vs v2 schema),
register them here and resolve by key in ProfileEngine.

Usage (future):
    register_extractor("v1", FeatureExtractorV1())
    extractor = EXTRACTORS["v1"]
"""

EXTRACTORS: dict = {}
VECTORIZERS: dict = {}


def register_extractor(name: str, extractor) -> None:
    EXTRACTORS[name] = extractor


def register_vectorizer(name: str, vectorizer) -> None:
    VECTORIZERS[name] = vectorizer
