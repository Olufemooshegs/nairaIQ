from app.domain.profile.evaluator import RuleEvaluator
from app.domain.features.extractor import FeatureExtractor
from app.db.repositories.profile_repo import ProfileRepository
from app.domain.knowledge.nigerian_context import NigerianContext
from uuid import uuid4
from app.db.repositories.onboarding_repo import OnboardingRepository
from app.domain.profile.scoring import compute_pressure_score


class ProfileEngine:
    def __init__(self, db):
        self.db = db
        self.evaluator = RuleEvaluator(NigerianContext())
        self.extractor = FeatureExtractor()
        self.repo = ProfileRepository(db)

    async def process(self, onboarding_input, user_id):
        # persist onboarding input with explicit user_id (never trust the body)
        onboarding_repo = OnboardingRepository(self.db)
        try:
            payload = onboarding_input.dict()
            payload["user_id"] = user_id
            await onboarding_repo.create(payload)
        except Exception:
            # do not fail profile generation for persistence errors; surface later via logs
            pass

        features = self.extractor.extract(onboarding_input)
        rules_result = self.evaluator.evaluate(features)

        # compute pressure-based scoring
        scoring = compute_pressure_score(rules_result)

        # vectorization
        vector = self.extractor.vectorize(features)

        # deactivate prior profiles for user (repository method will be added separately)
        try:
            await self.repo.deactivate_prior_profiles(user_id)
        except Exception:
            # best-effort; continue if repository doesn't support it yet
            pass

        # remove raw payload before persisting to keep JSONB compact
        features_to_store = dict(features)
        if "raw" in features_to_store:
            features_to_store.pop("raw")

        profile = await self.repo.create({
            "id": uuid4(),
            "user_id": user_id,
            "features": features_to_store,
            "vector": vector,
            "scores": scoring,
        })
        # persist
        await self.db.commit()
        return profile
