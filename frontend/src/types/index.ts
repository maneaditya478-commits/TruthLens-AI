export type ClaimStatus = 
  | 'VERIFIED'
  | 'POTENTIALLY_STALE'
  | 'CONTRADICTED'
  | 'UNVERIFIED'
  | 'CONFLICTING_EVIDENCE';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EvidenceItem {
  id?: string;
  title: string;
  url: string;
  snippet: string;
  published_date?: string | null;
  retrieved_at?: string;
  source_type?: string;
}

export interface EvaluationItem {
  id?: string;
  status: ClaimStatus;
  freshness_score: number;
  agreement_score: number;
  reliability_score: number;
  recency_score: number;
  diversity_score: number;
  explanation: string;
  correction_suggestion?: string | null;
}

export interface ClaimItem {
  id: string;
  claim_text: string;
  category: string;
  risk_level: RiskLevel;
  time_sensitive: boolean;
  evidence_list: EvidenceItem[];
  evaluation?: EvaluationItem | null;
}

export interface ModelUsageItem {
  id?: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  provider: string;
  created_at?: string;
}

export interface VerificationReport {
  id: string;
  input_text: string;
  original_question?: string | null;
  category: string;
  verification_mode: string;
  overall_score: number;
  total_claims: number;
  created_at: string;
  claims: ClaimItem[];
  model_usages: ModelUsageItem[];
}

export interface HistoryListItem {
  id: string;
  original_question?: string | null;
  category: string;
  verification_mode: string;
  overall_score: number;
  total_claims: number;
  created_at: string;
  input_snippet: string;
}

export interface DashboardStats {
  total_runs: number;
  total_claims: number;
  verified_claims: number;
  potentially_stale_claims: number;
  contradicted_claims: number;
  unverified_claims: number;
  conflicting_claims: number;
  avg_freshness_score: number;
  avg_latency_ms: number;
  total_tokens_consumed: number;
  status_distribution: { name: string; value: number; color: string }[];
  score_distribution: { range: string; count: number }[];
  activity_timeline: { date: string; runs: number; claims: number }[];
  category_freshness: { category: string; avg_score: number; runs: number }[];
  token_usage_history: { id: string; model: string; tokens: number; latency: number; time: string }[];
}

export interface SettingsState {
  bifrost_base_url: string;
  bifrost_model: string;
  bifrost_fallback_model: string;
  bifrost_key_configured: boolean;
  tavily_key_configured: boolean;
  environment: string;
}

export interface BenchmarkItem {
  id: string;
  claim_text: string;
  category: string;
  expected_status: ClaimStatus;
  expected_risk: RiskLevel;
  time_sensitive: boolean;
  ground_truth_notes: string;
}

export interface BenchmarkRunResult {
  summary: {
    total_evaluated: number;
    successful_runs: number;
    completion_rate_pct: number;
    stale_detection_precision: number;
    stale_detection_recall: number;
    stale_detection_f1: number;
    avg_latency_ms: number;
    tokens_per_verification: number;
  };
  detailed_results: Array<{
    id: string;
    claim_text: string;
    expected_status: string;
    predicted_status?: string;
    match: boolean;
    freshness_score?: number;
    evidence_count?: number;
    latency_ms?: number;
    error?: string;
  }>;
}
