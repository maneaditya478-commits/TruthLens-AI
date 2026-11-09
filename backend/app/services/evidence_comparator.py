import json
import re
import logging
from typing import List, Dict, Any, Tuple
from backend.app.services.bifrost_service import bifrost_service
from backend.app.services.freshness_scorer import freshness_scorer

logger = logging.getLogger("truthlens.evidence_comparator")

COMPARISON_SYSTEM_PROMPT = """You are TruthLens AI's Evidence Verification and Staleness Evaluation Engine.
Your task is to compare a specific factual claim against a collection of live web evidence retrieved from Tavily.

RULES OF EVIDENCE VERIFICATION:
1. Status must strictly be one of:
   - "VERIFIED": The live evidence directly and reliably supports the claim as current and factual.
   - "POTENTIALLY_STALE": The claim was historically accurate or partially true in past years/versions, but newer updates, releases, prices, or leadership exist in the evidence.
   - "CONTRADICTED": The evidence directly refutes the claim with reliable opposing facts.
   - "CONFLICTING_EVIDENCE": High-quality sources present conflicting or contradictory numbers/facts.
   - "UNVERIFIED": The evidence is insufficient, irrelevant, or does not address the core proposition.

2. Agreement Score (0 to 100):
   - 100: Total definitive agreement with current official evidence.
   - 70-90: Strong support with minor nuances.
   - 40-60: Ambiguous or mixed evidence.
   - 10-30: Evidence mostly contradicts or shows significant obsolescence.
   - 0: Total contradiction or completely unsupported.

3. Explanation:
   - Synthesize the evidence clearly.
   - Explicitly cite the evidence titles, dates, and version numbers where applicable.
   - Distinguish past information from current information.

4. Correction Suggestion:
   - If status is "POTENTIALLY_STALE" or "CONTRADICTED":
     Generate a precise, factually accurate updated statement based on the retrieved evidence.
     Explain clearly what changed and why the old claim is outdated.
   - If status is "VERIFIED" or "UNVERIFIED":
     Set correction_suggestion to null.

Output strictly valid JSON matching this schema:
{
  "status": "POTENTIALLY_STALE",
  "agreement_score": 25.0,
  "explanation": "While Python 3.11 was released in October 2022, Python 3.12 and 3.13 have since been released, making 3.13 the current latest stable version according to python.org documentation.",
  "correction_suggestion": "Python 3.13 is the latest stable version of Python as of late 2024/2025."
}
"""

class EvidenceComparatorService:
    """Compares claims against retrieved web evidence using Bifrost and FreshnessScorer."""

    def _clean_json_response(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def evaluate_claim(
        self,
        claim_text: str,
        category: str,
        risk_level: str,
        time_sensitive: bool,
        evidence_list: List[Dict[str, Any]]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Evaluates a claim against evidence.
        Returns:
            Tuple[Evaluation_Dict, Model_Usage_Dict]
        """
        # If no evidence retrieved, return UNVERIFIED immediately
        if not evidence_list:
            score_data = freshness_scorer.compute_score(
                agreement_score=0.0,
                evidence_list=[],
                risk_level=risk_level,
                status="UNVERIFIED"
            )
            return {
                "status": "UNVERIFIED",
                "freshness_score": score_data["overall_score"],
                "agreement_score": score_data["agreement_score"],
                "reliability_score": score_data["reliability_score"],
                "recency_score": score_data["recency_score"],
                "diversity_score": score_data["diversity_score"],
                "explanation": "No relevant live web evidence could be retrieved for this claim.",
                "correction_suggestion": None
            }, {
                "model_name": "rule-engine",
                "input_tokens": 0,
                "output_tokens": 0,
                "latency_ms": 0.0,
                "provider": "truthlens"
            }

        # Format evidence for the prompt
        formatted_evidence = []
        for i, ev in enumerate(evidence_list, 1):
            formatted_evidence.append(
                f"[Source {i}]: {ev.get('title', 'Unknown')} ({ev.get('source_type', 'web')})\n"
                f"URL: {ev.get('url')}\n"
                f"Date: {ev.get('published_date', 'Unknown')}\n"
                f"Snippet: {ev.get('snippet', '')}\n"
            )
        evidence_text = "\n".join(formatted_evidence)

        user_prompt = f"""CLAIM TO VERIFY:
\"{claim_text}\"

METADATA:
Category: {category}
Freshness Risk Level: {risk_level}
Time Sensitive: {time_sensitive}

LIVE WEB EVIDENCE RETRIEVED FROM TAVILY:
{evidence_text}

Evaluate this claim against the evidence and return valid JSON."""

        messages = [
            {"role": "system", "content": COMPARISON_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        raw_content, usage = await bifrost_service.chat_completion(
            messages=messages,
            temperature=0.0,
            response_format={"type": "json_object"}
        )

        try:
            cleaned = self._clean_json_response(raw_content)
            data = json.loads(cleaned)
        except Exception:
            json_match = re.search(r'\{[\s\S]*\}', raw_content)
            if json_match:
                data = json.loads(json_match.group(0))
            else:
                data = {
                    "status": "UNVERIFIED",
                    "agreement_score": 0.0,
                    "explanation": f"Evaluation could not parse LLM output: {raw_content[:150]}",
                    "correction_suggestion": None
                }

        raw_status = data.get("status", "UNVERIFIED").upper()
        if raw_status not in ("VERIFIED", "POTENTIALLY_STALE", "CONTRADICTED", "UNVERIFIED", "CONFLICTING_EVIDENCE"):
            raw_status = "UNVERIFIED"

        agreement = float(data.get("agreement_score", 50.0))
        explanation = data.get("explanation", "Verification completed.")
        correction = data.get("correction_suggestion")

        # Compute deterministic Freshness Score F = 0.40A + 0.25R + 0.25T + 0.10D
        score_data = freshness_scorer.compute_score(
            agreement_score=agreement,
            evidence_list=evidence_list,
            risk_level=risk_level,
            status=raw_status
        )

        evaluation_result = {
            "status": raw_status,
            "freshness_score": score_data["overall_score"],
            "agreement_score": score_data["agreement_score"],
            "reliability_score": score_data["reliability_score"],
            "recency_score": score_data["recency_score"],
            "diversity_score": score_data["diversity_score"],
            "explanation": f"{explanation}\n\n[Formula Breakdown]: {score_data['formula_explanation']}",
            "correction_suggestion": correction
        }

        return evaluation_result, usage

evidence_comparator = EvidenceComparatorService()
