import json
import re
import logging
from typing import List, Dict, Any, Tuple
from backend.app.services.bifrost_service import bifrost_service

logger = logging.getLogger("truthlens.claim_extractor")

EXTRACTION_SYSTEM_PROMPT = """You are TruthLens AI's Expert Claim Extraction and Freshness Risk Engine.
Your objective is to analyze an AI-generated response, extract atomic factual claims, and assess their freshness risk.

CRITICAL GUIDELINES:
1. Extract distinct, atomic factual statements that can be verified against independent sources.
2. Filter out pure opinions, rhetorical phrasing, advice, subjective impressions, and meta-commentary.
3. Every claim must stand alone as a testable proposition with its subject and predicate intact.
4. For each claim, determine:
   - claim_text: The standalone factual proposition.
   - category: One of ["Technology", "Software and APIs", "Business", "Government and Regulations", "Finance", "Science and Research", "General Knowledge"].
   - risk_level: Freshness risk classification:
     * "HIGH": Time-sensitive facts that change frequently (e.g., latest software versions, library releases, API pricing, active CEOs/leadership, current tax laws, active stock values).
     * "MEDIUM": Facts that evolve periodically over 1-3 years (e.g., company employee headcounts, market share, adoption stats, recent discoveries).
     * "LOW": Invariant or historical facts (e.g., historical dates, founders at inception, mathematical theorems, fundamental laws of physics).
   - time_sensitive: Boolean (true if the claim relies on "currently", "latest", "as of now", version numbers, or present pricing).
   - search_query: An optimized web search query designed to find official, primary evidence confirming or refuting the claim.

Return strictly a valid JSON object matching this schema:
{
  "claims": [
    {
      "claim_text": "Python 3.11 is the latest stable version of Python.",
      "category": "Software and APIs",
      "risk_level": "HIGH",
      "time_sensitive": true,
      "search_query": "latest stable Python release version official python.org"
    }
  ]
}
"""

class ClaimExtractorService:
    """Service to extract atomic claims and classify freshness risk via Bifrost."""

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown fences and trim whitespace."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def extract_claims(
        self,
        input_text: str,
        category_hint: str = "Technology",
        verification_mode: str = "standard"
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Extracts claims from input_text using Bifrost LLM inference.
        Returns:
            Tuple[List of claim dicts, model_usage_dict]
        """
        max_claims = 4 if verification_mode == "quick" else (8 if verification_mode == "standard" else 15)

        user_prompt = f"""Target Category Hint: {category_hint}
Verification Mode: {verification_mode} (Extract up to {max_claims} most important verifiable factual claims).

Text to analyze:
\"\"\"
{input_text}
\"\"\"

Extract the factual claims and output strictly valid JSON."""

        messages = [
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
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
            claims = data.get("claims", [])
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON directly from Bifrost response: {e}. Attempting regex extraction.")
            # Regex fallback to extract JSON array or object
            json_match = re.search(r'\{[\s\S]*\}', raw_content)
            if json_match:
                data = json.loads(json_match.group(0))
                claims = data.get("claims", [])
            else:
                raise ValueError(f"Could not parse valid claim JSON from Bifrost output: {raw_content[:200]}")

        # Validate and normalize each claim
        validated_claims = []
        for c in claims[:max_claims]:
            claim_text = c.get("claim_text", "").strip()
            if not claim_text or len(claim_text) < 5:
                continue

            category = c.get("category", category_hint)
            risk_level = c.get("risk_level", "MEDIUM").upper()
            if risk_level not in ("HIGH", "MEDIUM", "LOW"):
                risk_level = "MEDIUM"

            time_sensitive = bool(c.get("time_sensitive", False))
            search_query = c.get("search_query", claim_text).strip()

            validated_claims.append({
                "claim_text": claim_text,
                "category": category,
                "risk_level": risk_level,
                "time_sensitive": time_sensitive,
                "search_query": search_query
            })

        logger.info(f"Extracted {len(validated_claims)} atomic claims from text.")
        return validated_claims, usage

claim_extractor = ClaimExtractorService()
