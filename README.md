# TruthLens AI

> **"Don't Just Trust AI. Verify It."**

An intelligent verification and information freshness platform that analyzes AI-generated answers, extracts atomic factual claims, detects outdated or stale statements, retrieves live primary web evidence, and generates transparent, evidence-backed verification reports.

Built for **Problem Statement 06: Build a Stale-Answer Detector for AI Applications**.

---

## 🚀 Key Integrations

1. **Bifrost by Maxim AI:**
   - Centralized AI model gateway for LLM inference.
   - Provider routing, model management, token usage tracking, and automatic fallback.
   - All AI operations pass strictly through Bifrost:
     - Atomic claim extraction
     - Temporal risk classification (High / Medium / Low)
     - Evidence comparison and staleness evaluation
     - Automatic factual correction synthesis
2. **Tavily Live Web Search:**
   - Real-time evidence retrieval across official software docs, registries, government filings, and verified publishers.
   - Rich snippet extraction, URL canonicalization, publication date parsing, and source authority ranking.

---

## 🔬 Freshness Scoring Engine

TruthLens AI calculates an objective, deterministic Freshness Score ($F$) on a scale of $0$ to $100$:

$$F = 0.40A + 0.25R + 0.25T + 0.10D$$

- **$A$ (Evidence Agreement, 40%):** Degree of semantic alignment between the claim and live web evidence.
- **$R$ (Source Reliability, 25%):** Weighted authority score based on domain class:
  - Official documentation (`docs.python.org`, `github.com`): 95
  - Government & regulatory portals (`.gov`): 95
  - Academic institutions & arXiv (`.edu`): 90
  - Technical documentation: 85
  - Verified news publishers: 75
  - Standard web: 60
- **$T$ (Evidence Recency, 25%):** Temporal decay rate relative to the claim's update volatility.
- **$D$ (Source Diversity, 10%):** Variety and independence of domain sources.

If evidence is unavailable, the claim receives an explicit `UNVERIFIED` status with a $0.0$ score, avoiding misleading halluncinated ratings.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend:** Python 3.13, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, SQLite (PostgreSQL compatible).
- **AI & Evidence:** Maxim AI Bifrost Gateway, Tavily Search API.
- **Testing:** Pytest, pytest-asyncio, FastAPI TestClient.

---

## 💻 Quick Start & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend

```bash
# Clone the repository
git clone https://github.com/your-username/TruthLens-AI.git
cd TruthLens-AI

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS / Linux

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your API keys in `.env` (or via the UI Settings page at runtime):

```env
# Bifrost AI Gateway (Maxim AI)
BIFROST_BASE_URL=https://api.bifrost.maxim.ai/v1
BIFROST_API_KEY=your_bifrost_api_key_here
BIFROST_MODEL=gpt-4o-mini
BIFROST_FALLBACK_MODEL=claude-3-5-haiku

# Tavily Live Search API
TAVILY_API_KEY=tvly-your_tavily_api_key_here

# Database
DATABASE_URL=sqlite:///./truthlens.db
PORT=8000
HOST=0.0.0.0
```

### 3. Seed Demonstration Data & Run Tests

```bash
# Seed initial verification runs & demo scenario
python -m backend.app.seed

# Run automated tests
pytest backend/tests -v
```

### 4. Build and Launch the Application

You can run the full-stack application in either of two modes:

#### Option A: Unified Full-Stack Server (FastAPI serves both API and React frontend)
```bash
# Build the React frontend
cd frontend
npm install
npm run build
cd ..

# Start the unified server
python backend/run.py
```
Open your browser at **`http://localhost:8000`**. The full React dashboard is served directly with API endpoints active at `/api`.

#### Option B: Dual Development Server (HMR enabled)
```bash
# Terminal 1: Backend
python backend/run.py

# Terminal 2: Frontend (Vite)
cd frontend
npm run dev
```
Open **`http://localhost:5173`**.

---

## 🎯 Master Demonstration Scenario

The application includes the hackathon prompt's exact demonstration scenario pre-loaded in the database and accessible via the **"Master Hackathon Demo Scenario"** preset chip on the New Verification page:

### Input:
> *"Python 3.11 is the latest stable Python version. Company XYZ currently has 10,000 employees. The latest version of Product ABC costs $20 per month."*

### System Execution:
1. **Claim Extraction:** Extracts 3 atomic claims with categories and high freshness risk.
2. **Tavily Live Evidence:** Retrieves official releases from `docs.python.org` and PEP 719.
3. **Bifrost Evaluation:**
   - **Claim 1 (Python 3.11):** Marked `POTENTIALLY_STALE` ($F = 36.4/100$). Generates correction: *"Python 3.13 is the latest stable release series of Python as of late 2024/2025."*
   - **Claim 2 (Company XYZ):** Marked `UNVERIFIED` ($F = 0.0/100$) due to non-existent corporate registry.
   - **Claim 3 (Product ABC):** Marked `UNVERIFIED` ($F = 0.0/100$) due to fictitious entity.
4. **Transparent Citations:** Cites PEP 719, Python documentation URLs, and published dates.

---

## 📊 Evaluation & Benchmark Suite

TruthLens AI includes a **22-claim ground-truth labeled evaluation benchmark** covering:
- Software versions & API breaking changes
- Current corporate executives (CEOs)
- Active product subscription pricing
- Deprecated operating systems (Windows 7 EOL)
- Historical milestones & scientific physical constants
- Conflicting expert projections

Access the benchmark suite via the **Benchmark & Evaluation** tab in the sidebar or run it programmatically via `POST /api/benchmark/run`.

---

## 🛡️ Reliability & Security Highlights

- **Backend-Only Secrets:** No API keys are bundled into frontend assets or exposed in client bundles.
- **Fail-Safe Freshness:** If evidence is absent, the system assigns an explicit `UNVERIFIED` status instead of hallucinating support.
- **Untrusted Web Treatment:** Retrieved web pages are strictly treated as passive evidence data with prompt injection isolation.
- **Bifrost Centralization:** All LLM operations route through Bifrost for unified rate limiting, telemetry, and fallback routing.
