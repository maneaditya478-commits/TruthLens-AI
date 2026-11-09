# TruthLens AI - Testing & Benchmarking Guide

## 1. Test Suite Overview

TruthLens AI includes a comprehensive automated test suite and an evaluation benchmarking harness:

1. **Unit & Mathematical Tests (`backend/tests/test_freshness_scorer.py`):**
   - Verifies the strict mathematical computation of the master formula $F = 0.40A + 0.25R + 0.25T + 0.10D$.
   - Confirms bounded values between $0$ and $100$.
   - Asserts that unverified/empty evidence yields an explicit 0-score with insufficient evidence explanation.
   - Tests recency decay rates between high-risk and low-risk entities.

2. **API Endpoint & Database Tests (`backend/tests/test_api.py`):**
   - Health check endpoint (`GET /api/health`).
   - Settings management endpoint (`GET /api/settings`).
   - Ground-truth benchmark dataset retrieval (`GET /api/benchmark/dataset`).
   - Verification history audit (`GET /api/history`).
   - Real database analytics calculation (`GET /api/dashboard/stats`).

3. **Ground-Truth Benchmark Suite (`backend/benchmark/ground_truth_dataset.json`):**
   - 22 manually labeled test claims spanning software releases, API pricing, executive leadership, operating systems, and scientific invariants.
   - Live runner (`POST /api/benchmark/run`) measuring precision, recall, F1-score, pipeline latency, and LLM token usage.

---

## 2. Running Automated Tests

Run the test suite from the project root:

```bash
# Activate virtual environment
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS / Linux

# Run all pytest suites
pytest backend/tests -v
```

### Current Test Execution Output:
```
backend/tests/test_api.py::test_health PASSED                            [ 14%]
backend/tests/test_api.py::test_settings PASSED                          [ 28%]
backend/tests/test_api.py::test_benchmark_dataset PASSED                 [ 42%]
backend/tests/test_api.py::test_history PASSED                           [ 57%]
backend/tests/test_api.py::test_dashboard_stats PASSED                   [ 71%]
backend/tests/test_freshness_scorer.py::test_freshness_formula_calculation PASSED [ 85%]
backend/tests/test_freshness_scorer.py::test_unverified_returns_zero_score PASSED [100%]

======================== 7 passed in 1.49s ========================
```

---

## 3. Ground-Truth Benchmark Dataset (22 Claims)

| Claim ID | Claim Proposition | Expected Status | Freshness Risk | Domain |
|---|---|---|---|---|
| `claim-01` | Python 3.11 is the latest stable version of Python. | `POTENTIALLY_STALE` | HIGH | Software and APIs |
| `claim-02` | Python 3.13 is the latest stable release of Python. | `VERIFIED` | HIGH | Software and APIs |
| `claim-03` | Guido van Rossum created Python and first released it in 1991. | `VERIFIED` | LOW | Technology |
| `claim-04` | Parag Agrawal is currently the CEO of Twitter. | `CONTRADICTED` | HIGH | Business |
| `claim-05` | Sundar Pichai is the CEO of Alphabet Inc. | `VERIFIED` | HIGH | Business |
| `claim-06` | OpenAI released GPT-4 in March 2023. | `VERIFIED` | LOW | Technology |
| `claim-07` | The monthly subscription price for ChatGPT Plus is $20 per month. | `VERIFIED` | HIGH | Software and APIs |
| `claim-08` | Windows 7 is Microsoft's currently supported flagship operating system. | `CONTRADICTED` | HIGH | Software and APIs |
| `claim-09` | The speed of light in a vacuum is 299,792,458 meters per second. | `VERIFIED` | LOW | Science and Research |
| `claim-10` | Albert Einstein received the Nobel Prize in Physics for the discovery of the photoelectric effect. | `VERIFIED` | LOW | Science and Research |
| `claim-11` | The iPhone 11 Pro is Apple's latest flagship smartphone. | `POTENTIALLY_STALE` | HIGH | Technology |
| `claim-12` | A standard Tesla Model 3 has a battery driving range of 1,500 miles on a single charge. | `CONTRADICTED` | HIGH | Technology |
| `claim-13` | Amazon Web Services (AWS) originally launched in 2006. | `VERIFIED` | LOW | Technology |
| `claim-14` | Boris Johnson is the current Prime Minister of the United Kingdom. | `CONTRADICTED` | HIGH | Government and Regulations |
| `claim-15` | React 19 was officially announced and released with React Server Actions and Actions support. | `VERIFIED` | HIGH | Software and APIs |
| `claim-16` | AngularJS 1.x is currently actively receiving new major feature updates from Google. | `CONTRADICTED` | HIGH | Software and APIs |
| `claim-17` | The United States federal statutory corporate income tax rate under the TCJA is 21%. | `VERIFIED` | MEDIUM | Finance |
| `claim-18` | Quantum computers from Aethelgard Quantum Inc operate at room temperature with 1 million logical qubits. | `UNVERIFIED` | HIGH | Science and Research |
| `claim-19` | The United Nations declared that the world population reached 8 billion people in November 2022. | `VERIFIED` | LOW | General Knowledge |
| `claim-20` | Google was founded in September 1998 by Larry Page and Sergey Brin. | `VERIFIED` | LOW | Technology |
| `claim-21` | The total market capitalization of Apple is exactly $50 billion. | `CONTRADICTED` | HIGH | Finance |
| `claim-22` | Expert timelines for when Artificial General Intelligence will arrive range widely between 2026 and 2040. | `CONFLICTING_EVIDENCE` | MEDIUM | Science and Research |
