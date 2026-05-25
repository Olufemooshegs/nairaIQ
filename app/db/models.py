from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OnboardingInput(Base):
    __tablename__ = "onboarding_inputs"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    payload = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    features = Column(JSONB, nullable=False)
    vector = Column(JSONB, nullable=False)
    scores = Column(JSONB, nullable=False)
    meta = Column(JSONB)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AnalyticsState(Base):
    __tablename__ = "analytics_states"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    profile_id = Column(PGUUID(as_uuid=True), ForeignKey("financial_profiles.id"), nullable=False)
    metrics = Column(JSONB, nullable=False)
    scores = Column(JSONB, nullable=False)
    meta = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class FinancialInsight(Base):
    __tablename__ = "financial_insights"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analytics_state_id = Column(PGUUID(as_uuid=True), ForeignKey("analytics_states.id"), nullable=False)
    intent = Column(String(100), nullable=False)
    rendered = Column(JSONB, nullable=False)
    meta = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
