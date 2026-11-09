from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Verification & Pipeline Inputs ---
class VerifyRequest(BaseModel):
    input_text: str = Field(..., description="The AI-generated answer to verify", min_length=5)
    original_question: Optional[str] = Field(default=None, description="Original user prompt or question")
    category: str = Field(default="Technology", description="Verification category")
    verification_mode: str = Field(default="standard", description="quick, standard, or deep")

class ExtractClaimsRequest(BaseModel):
    input_text: str = Field(..., min_length=5)
    category: Optional[str] = "Technology"

class SearchRequest(BaseModel):
    claim_text: str = Field(..., min_length=3)
    depth: Optional[str] = "standard"  # quick, standard, deep

class EvidenceItem(BaseModel):
    title: str
    url: str
    snippet: str
    published_date: Optional[str] = None
    source_type: Optional[str] = "web"

class EvaluateRequest(BaseModel):
    claim_text: str
    category: Optional[str] = "General"
    risk_level: Optional[str] = "MEDIUM"
    time_sensitive: Optional[bool] = False
    evidence: List[EvidenceItem]

# --- Output Schemas ---
class EvidenceResponse(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    snippet: str
    published_date: Optional[str] = None
    retrieved_at: Optional[datetime] = None
    source_type: Optional[str] = "web"

    class Config:
        from_attributes = True

class EvaluationResponse(BaseModel):
    id: Optional[str] = None
    status: str
    freshness_score: float
    agreement_score: float
    reliability_score: float
    recency_score: float
    diversity_score: float
    explanation: str
    correction_suggestion: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ClaimResponse(BaseModel):
    id: Optional[str] = None
    claim_text: str
    category: str
    risk_level: str
    time_sensitive: bool
    evidence_list: List[EvidenceResponse] = []
    evaluation: Optional[EvaluationResponse] = None

    class Config:
        from_attributes = True

class ModelUsageResponse(BaseModel):
    id: Optional[str] = None
    model_name: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    provider: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VerificationRunResponse(BaseModel):
    id: str
    input_text: str
    original_question: Optional[str] = None
    category: str
    verification_mode: str
    overall_score: float
    total_claims: int
    created_at: datetime
    claims: List[ClaimResponse] = []
    model_usages: List[ModelUsageResponse] = []

    class Config:
        from_attributes = True

class VerificationRunListItem(BaseModel):
    id: str
    original_question: Optional[str] = None
    category: str
    verification_mode: str
    overall_score: float
    total_claims: int
    created_at: datetime
    input_snippet: str

class DashboardStatsResponse(BaseModel):
    total_runs: int
    total_claims: int
    verified_claims: int
    potentially_stale_claims: int
    contradicted_claims: int
    unverified_claims: int
    conflicting_claims: int
    avg_freshness_score: float
    avg_latency_ms: float
    total_tokens_consumed: int
    status_distribution: List[Dict[str, Any]]
    score_distribution: List[Dict[str, Any]]
    activity_timeline: List[Dict[str, Any]]
    category_freshness: List[Dict[str, Any]]
    token_usage_history: List[Dict[str, Any]]

class UsageStatsResponse(BaseModel):
    total_calls: int
    total_input_tokens: int
    total_output_tokens: int
    avg_latency_ms: float
    active_model: str
    provider: str
    gateway_status: str
    recent_calls: List[Dict[str, Any]]

class SettingsResponse(BaseModel):
    bifrost_base_url: str
    bifrost_model: str
    bifrost_fallback_model: str
    bifrost_key_configured: bool
    tavily_key_configured: bool
    environment: str

class UpdateSettingsRequest(BaseModel):
    bifrost_base_url: Optional[str] = None
    bifrost_api_key: Optional[str] = None
    bifrost_model: Optional[str] = None
    tavily_api_key: Optional[str] = None
