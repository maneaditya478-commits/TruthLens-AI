import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    input_text = Column(Text, nullable=False)
    original_question = Column(Text, nullable=True)
    category = Column(String(100), default="General Knowledge")
    verification_mode = Column(String(50), default="standard")
    overall_score = Column(Float, default=0.0)
    total_claims = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    claims = relationship("Claim", back_populates="run", cascade="all, delete-orphan", lazy="joined")
    model_usages = relationship("ModelUsage", back_populates="run", cascade="all, delete-orphan", lazy="joined")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("verification_runs.id"), nullable=False, index=True)
    claim_text = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    risk_level = Column(String(50), default="MEDIUM")
    time_sensitive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    run = relationship("VerificationRun", back_populates="claims")
    evidence_list = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan", lazy="joined")
    evaluation = relationship("Evaluation", back_populates="claim", uselist=False, cascade="all, delete-orphan", lazy="joined")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_id = Column(String(36), ForeignKey("claims.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(2000), nullable=False)
    snippet = Column(Text, nullable=False)
    published_date = Column(String(100), nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    source_type = Column(String(100), default="web")

    # Relationships
    claim = relationship("Claim", back_populates="evidence_list")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_id = Column(String(36), ForeignKey("claims.id"), unique=True, nullable=False, index=True)
    status = Column(String(50), nullable=False)
    freshness_score = Column(Float, default=0.0)
    agreement_score = Column(Float, default=0.0)
    reliability_score = Column(Float, default=0.0)
    recency_score = Column(Float, default=0.0)
    diversity_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=False)
    correction_suggestion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    claim = relationship("Claim", back_populates="evaluation")


class ModelUsage(Base):
    __tablename__ = "model_usage"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("verification_runs.id"), nullable=True, index=True)
    model_name = Column(String(100), nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    provider = Column(String(100), default="bifrost")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    run = relationship("VerificationRun", back_populates="model_usages")
