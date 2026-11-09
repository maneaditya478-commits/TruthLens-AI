import math
from typing import List, Dict, Any, Tuple
from datetime import datetime

class FreshnessScorer:
    """
    Freshness Scoring Engine implementing:
    F = 0.40*A + 0.25*R + 0.25*T + 0.10*D
    
    A = Agreement between the claim and retrieved evidence (0-100)
    R = Source reliability (0-100)
    T = Recency of evidence relative to claim update frequency (0-100)
    D = Diversity and independence of evidence sources (0-100)
    """

    SOURCE_RELIABILITY_WEIGHTS = {
        "official": 95.0,
        "government": 95.0,
        "academic": 90.0,
        "documentation": 85.0,
        "news": 75.0,
        "web": 60.0
    }

    def calculate_reliability(self, evidence_list: List[Dict[str, Any]]) -> float:
        """Calculate weighted source reliability based on domains and authority."""
        if not evidence_list:
            return 0.0

        scores = [
            self.SOURCE_RELIABILITY_WEIGHTS.get(item.get("source_type", "web"), 60.0)
            for item in evidence_list
        ]
        # Rewarding having at least one top-tier source
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        return round(0.7 * max_score + 0.3 * avg_score, 1)

    def calculate_recency(self, evidence_list: List[Dict[str, Any]], risk_level: str) -> float:
        """
        Calculate recency score based on publication dates and risk level.
        High risk claims decay much faster if evidence is older than 6 months.
        """
        if not evidence_list:
            return 0.0

        current_year = 2026  # Hackathon system year
        dated_items = 0
        total_recency = 0.0

        for item in evidence_list:
            pub_date = item.get("published_date")
            if not pub_date:
                continue

            dated_items += 1
            # Try to parse year
            try:
                if len(pub_date) >= 4 and pub_date[:4].isdigit():
                    year = int(pub_date[:4])
                    years_old = max(0, current_year - year)

                    if risk_level == "HIGH":
                        # Steep decay for high-risk time-sensitive claims
                        score = max(10.0, 100.0 - (years_old * 35.0))
                    elif risk_level == "MEDIUM":
                        score = max(25.0, 100.0 - (years_old * 20.0))
                    else:  # LOW
                        score = max(50.0, 100.0 - (years_old * 10.0))

                    total_recency += score
            except Exception:
                continue

        if dated_items == 0:
            # If no explicit dates found, default to moderate neutral recency
            return 50.0 if risk_level == "HIGH" else 65.0

        return round(total_recency / dated_items, 1)

    def calculate_diversity(self, evidence_list: List[Dict[str, Any]]) -> float:
        """Calculate source diversity and domain independence (0-100)."""
        if not evidence_list:
            return 0.0

        from urllib.parse import urlparse
        domains = set()
        source_types = set()

        for item in evidence_list:
            url = item.get("url", "")
            if url:
                parsed = urlparse(url).netloc.lower()
                domains.add(parsed)
            st = item.get("source_type", "web")
            source_types.add(st)

        unique_domains = len(domains)
        # 1 domain = 40, 2 domains = 70, 3+ domains = 90-100
        domain_score = min(100.0, unique_domains * 33.3)
        type_bonus = min(20.0, len(source_types) * 10.0)

        return round(min(100.0, 0.8 * domain_score + 0.2 * type_bonus), 1)

    def compute_score(
        self,
        agreement_score: float,
        evidence_list: List[Dict[str, Any]],
        risk_level: str,
        status: str
    ) -> Dict[str, Any]:
        """
        Computes overall freshness score F and breakdown:
        F = 0.40*A + 0.25*R + 0.25*T + 0.10*D
        """
        if status == "UNVERIFIED" or not evidence_list:
            return {
                "overall_score": 0.0,
                "agreement_score": 0.0,
                "reliability_score": 0.0,
                "recency_score": 0.0,
                "diversity_score": 0.0,
                "formula_explanation": "Insufficient evidence available. A score cannot be reliably computed."
            }

        # Normalize agreement score (0-100)
        A = max(0.0, min(100.0, float(agreement_score)))
        R = self.calculate_reliability(evidence_list)
        T = self.calculate_recency(evidence_list, risk_level)
        D = self.calculate_diversity(evidence_list)

        # Apply master formula
        F = round((0.40 * A) + (0.25 * R) + (0.25 * T) + (0.10 * D), 1)
        F = max(0.0, min(100.0, F))

        explanation = (
            f"F = 0.40*(A: {A:.1f}) + 0.25*(R: {R:.1f}) + 0.25*(T: {T:.1f}) + 0.10*(D: {D:.1f}) = {F:.1f}/100. "
            f"Agreement: {A:.0f}%, Source Reliability: {R:.0f}%, Evidence Recency: {T:.0f}%, Source Diversity: {D:.0f}%."
        )

        return {
            "overall_score": F,
            "agreement_score": A,
            "reliability_score": R,
            "recency_score": T,
            "diversity_score": D,
            "formula_explanation": explanation
        }

freshness_scorer = FreshnessScorer()
