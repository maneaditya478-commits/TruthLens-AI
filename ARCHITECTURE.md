# TruthLens AI - System Architecture

## 1. High-Level System Architecture

TruthLens AI is an intelligent verification and information freshness platform designed to detect stale, outdated, or contradicted claims in AI-generated answers. It integrates **Bifrost by Maxim AI** as the centralized LLM gateway and **Tavily** for live web search and evidence retrieval.

```mermaid
flowchart TD
    User["User / AI Application"] --> UI["React + TypeScript Frontend\n(Vite + Tailwind + Recharts)"]
    UI --> API["FastAPI Backend Application\n(/api/verify, /api/reports, /api/stats)"]
    
    subgraph "TruthLens AI Core Engine"
        API --> Extractor["1. Claim Extraction Engine\n(Extracts atomic propositions & temporal entities)"]
        Extractor --> Risk["2. Freshness Risk Classifier\n(High / Medium / Low Risk)"]
        
        Risk --> Tavily["3. Tavily Live Search API\n(Primary sources, documentation, news)"]
        Risk --> Bifrost["4. Bifrost Gateway (Maxim AI)\n(LLM routing, fallback & telemetry)"]
        
        Tavily --> EvidencePool["Retrieved Web Evidence\n(URLs, dates, snippets, source tier)"]
        Bifrost --> Comparator["5. Evidence Comparison Engine\n(Analyzes agreement & recency)"]
        EvidencePool --> Comparator
        
        Comparator --> Scorer["6. Freshness Scoring Engine\nF = 0.40A + 0.25R + 0.25T + 0.10D"]
        Scorer --> Corrector["7. Automatic Correction Generator\n(Generates evidence-backed correction)"]
    end
    
    Corrector --> DB[(SQLAlchemy Database\nRuns, Claims, Evidence, Usage)]
    DB --> UI
```

---

## 2. Verification Pipeline Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Dashboard
    participant Backend as FastAPI Backend
    participant Bifrost as Bifrost Gateway (Maxim AI)
    participant Tavily as Tavily Search API
    participant DB as SQLite / PostgreSQL

    User->>Frontend: Submit AI answer & category
    Frontend->>Backend: POST /api/verify
    Backend->>DB: Create VerificationRun record
    Backend->>Bifrost: Extract atomic claims & classify freshness risk
    Bifrost-->>Backend: Structured Claims JSON + Token Usage
    Backend->>DB: Store Claims & ModelUsage

    loop For each extracted claim
        Backend->>Tavily: Search web evidence (domain-targeted query)
        Tavily-->>Backend: Evidence snippets, URLs, published dates
        Backend->>DB: Store Evidence records
        Backend->>Bifrost: Compare claim against evidence
        Bifrost-->>Backend: Agreement score, explanation, suggested correction
        Backend->>Backend: Compute Master Freshness Score F
        Backend->>DB: Store Evaluation record
    end

    Backend-->>Frontend: VerificationRun with claims, scores, and evidence
    Frontend->>User: Interactive report with gauge, source links & correction
```

---

## 3. Database Entity-Relationship Model (ERD)

```mermaid
erDiagram
    USERS ||--o{ VERIFICATION_RUNS : owns
    VERIFICATION_RUNS ||--|{ CLAIMS : contains
    VERIFICATION_RUNS ||--o{ MODEL_USAGE : tracks
    CLAIMS ||--o{ EVIDENCE : has
    CLAIMS ||--|| EVALUATIONS : evaluated_by

    VERIFICATION_RUNS {
        string id PK
        text input_text
        text original_question
        string category
        string verification_mode
        float overall_score
        int total_claims
        datetime created_at
    }

    CLAIMS {
        string id PK
        string run_id FK
        text claim_text
        string category
        string risk_level
        boolean time_sensitive
        datetime created_at
    }

    EVIDENCE {
        string id PK
        string claim_id FK
        string title
        string url
        text snippet
        string published_date
        datetime retrieved_at
        string source_type
    }

    EVALUATIONS {
        string id PK
        string claim_id FK
        string status
        float freshness_score
        float agreement_score
        float reliability_score
        float recency_score
        float diversity_score
        text explanation
        text correction_suggestion
        datetime created_at
    }

    MODEL_USAGE {
        string id PK
        string run_id FK
        string model_name
        int input_tokens
        int output_tokens
        float latency_ms
        string provider
        datetime created_at
    }
```

---

## 4. Freshness Scoring Engine Mathematical Formulation

The freshness score ($F$) is evaluated on a scale of $0$ to $100$ according to the master formula:

$$F = 0.40A + 0.25R + 0.25T + 0.10D$$

Where:
- **$A$ (Agreement Score, $0-100$):** Semantic alignment between the claim and the retrieved live web evidence.
- **$R$ (Source Reliability, $0-100$):** Weighted authority tier:
  - Official documentation & registry domains (e.g. `docs.python.org`, `github.com`): $95$
  - Government & military domains (`.gov`, `.mil`): $95$
  - Academic institutions & arXiv (`.edu`, `arxiv.org`): $90$
  - Technical documentation: $85$
  - Verified news publishers: $75$
  - General web: $60$
- **$T$ (Evidence Recency, $0-100$):** Decay function based on publication/update year relative to the claim's freshness risk category (steep decay for High Risk; moderate for Medium Risk; gentle for Low Risk).
- **$D$ (Source Diversity, $0-100$):** Domain independence and variety across evidence sources.

If no authoritative evidence is found, the status is set to `UNVERIFIED` and the score evaluates to $0.0$, preventing misleading hallucinated ratings.
