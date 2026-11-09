import os
import json
import time
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from backend.app.config import settings
from backend.app.services.claim_extractor import claim_extractor
from backend.app.services.tavily_service import tavily_service
from backend.app.services.evidence_comparator import evidence_comparator

router = APIRouter()

# Locate ground_truth_dataset.json relative to backend/
CURRENT_DIR = Path(__file__).resolve()
BENCHMARK_FILE = CURRENT_DIR.parent.parent.parent / "benchmark" / "ground_truth_dataset.json"

def load_ground_truth() -> List[Dict[str, Any]]:
    if not BENCHMARK_FILE.exists():
        # Fallback to current working directory relative
        alt_path = Path("backend/benchmark/ground_truth_dataset.json")
        if alt_path.exists():
            with open(alt_path, "r", encoding="utf-8") as f:
                return json.load(f)
        raise FileNotFoundError(f"Ground truth dataset not found at {BENCHMARK_FILE}")

    with open(BENCHMARK_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/benchmark/dataset")
def get_benchmark_dataset():
    """Retrieve the ground truth benchmark dataset of 22 verified/stale/contradicted claims."""
    return load_ground_truth()

@router.post("/benchmark/run")
async def run_benchmark_evaluation(sample_size: int = 5):
    """
    Runs a live benchmark evaluation against the ground truth dataset.
    Calculates precision, recall, F1, latency, token usage, and completion rate.
    """
    if not settings.BIFROST_API_KEY or not settings.TAVILY_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both BIFROST_API_KEY and TAVILY_API_KEY must be configured to run the live benchmark."
        )

    dataset = load_ground_truth()
    eval_subset = dataset[:min(sample_size, len(dataset))]

    results = []
    total_tokens = 0
    latencies = []
    
    tp_stale = 0
    fp_stale = 0
    fn_stale = 0
    tn_stale = 0
    
    successful_runs = 0

    for item in eval_subset:
        claim_text = item["claim_text"]
        expected_status = item["expected_status"]
        expected_risk = item["expected_risk"]
        time_sensitive = item["time_sensitive"]
        category = item["category"]

        start_time = time.perf_counter()
        try:
            # 1. Search Tavily for evidence
            evidence = await tavily_service.search_claim(claim_text, search_depth="basic", max_results=3)
            
            # 2. Evaluate via Bifrost
            evaluation, usage = await evidence_comparator.evaluate_claim(
                claim_text=claim_text,
                category=category,
                risk_level=expected_risk,
                time_sensitive=time_sensitive,
                evidence_list=evidence
            )

            latency = round((time.perf_counter() - start_time) * 1000, 2)
            latencies.append(latency)
            total_tokens += usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
            successful_runs += 1

            predicted_status = evaluation["status"]

            is_expected_problematic = expected_status in ("POTENTIALLY_STALE", "CONTRADICTED")
            is_predicted_problematic = predicted_status in ("POTENTIALLY_STALE", "CONTRADICTED")

            if is_expected_problematic and is_predicted_problematic:
                tp_stale += 1
            elif not is_expected_problematic and is_predicted_problematic:
                fp_stale += 1
            elif is_expected_problematic and not is_predicted_problematic:
                fn_stale += 1
            else:
                tn_stale += 1

            results.append({
                "id": item["id"],
                "claim_text": claim_text,
                "expected_status": expected_status,
                "predicted_status": predicted_status,
                "match": (expected_status == predicted_status),
                "freshness_score": evaluation["freshness_score"],
                "evidence_count": len(evidence),
                "latency_ms": latency
            })
        except Exception as e:
            results.append({
                "id": item["id"],
                "claim_text": claim_text,
                "expected_status": expected_status,
                "error": str(e),
                "match": False
            })

    precision = tp_stale / (tp_stale + fp_stale) if (tp_stale + fp_stale) > 0 else 1.0
    recall = tp_stale / (tp_stale + fn_stale) if (tp_stale + fn_stale) > 0 else 1.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    completion_rate = round((successful_runs / len(eval_subset)) * 100, 1)
    avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0.0
    tokens_per_verification = round(total_tokens / successful_runs, 1) if successful_runs > 0 else 0.0

    return {
        "summary": {
            "total_evaluated": len(eval_subset),
            "successful_runs": successful_runs,
            "completion_rate_pct": completion_rate,
            "stale_detection_precision": round(precision, 3),
            "stale_detection_recall": round(recall, 3),
            "stale_detection_f1": round(f1, 3),
            "avg_latency_ms": avg_latency,
            "tokens_per_verification": tokens_per_verification
        },
        "detailed_results": results
    }
