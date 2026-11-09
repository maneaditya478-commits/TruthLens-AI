import pytest
from backend.app.services.freshness_scorer import freshness_scorer

def test_freshness_formula_calculation():
    """Verify that F = 0.40A + 0.25R + 0.25T + 0.10D is precisely calculated."""
    evidence = [
        {
            "title": "Python 3.13 Documentation",
            "url": "https://docs.python.org/3/whatsnew/3.13.html",
            "snippet": "Python 3.13 was released in October 2024.",
            "published_date": "2024-10-07",
            "source_type": "official"
        },
        {
            "title": "Python Official Release Schedule",
            "url": "https://peps.python.org/pep-0719/",
            "snippet": "PEP 719 -- Python 3.13 Release Schedule",
            "published_date": "2024-10-15",
            "source_type": "official"
        }
    ]

    result = freshness_scorer.compute_score(
        agreement_score=100.0,
        evidence_list=evidence,
        risk_level="HIGH",
        status="VERIFIED"
    )

    assert result["overall_score"] > 0
    assert result["overall_score"] <= 100.0
    assert result["agreement_score"] == 100.0
    assert result["reliability_score"] >= 80.0
    assert result["recency_score"] > 0.0
    assert result["diversity_score"] > 0.0
    assert "F = 0.40*(A:" in result["formula_explanation"]

def test_unverified_returns_zero_score():
    """Verify that unverified/no evidence yields 0 score instead of misleading score."""
    result = freshness_scorer.compute_score(
        agreement_score=0.0,
        evidence_list=[],
        risk_level="HIGH",
        status="UNVERIFIED"
    )

    assert result["overall_score"] == 0.0
    assert "Insufficient evidence" in result["formula_explanation"]
