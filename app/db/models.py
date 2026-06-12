from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, JSON
import uuid
import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(120), nullable=True)
    last_name = Column(String(120), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    phone_number = Column(String(32), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OnboardingInput(Base):
    __tablename__ = "onboarding_inputs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    payload = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    features = Column(JSON, nullable=False)
    vector = Column(JSON, nullable=False)
    scores = Column(JSON, nullable=False)
    meta = Column(JSON)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AnalyticsState(Base):
    __tablename__ = "analytics_states"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    profile_id = Column(String(36), ForeignKey("financial_profiles.id"), nullable=False)
    metrics = Column(JSON, nullable=False)
    scores = Column(JSON, nullable=False)
    meta = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class FinancialInsight(Base):
    __tablename__ = "financial_insights"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analytics_state_id = Column(String(36), ForeignKey("analytics_states.id"), nullable=False)
    intent = Column(String(100), nullable=False)
    rendered = Column(JSON, nullable=False)
    meta = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
