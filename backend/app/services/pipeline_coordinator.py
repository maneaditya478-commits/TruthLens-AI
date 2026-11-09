import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.schema_models import (
    VerificationRun,
    Claim,
    Evidence,
    Evaluation,
    ModelUsage,
    generate_uuid
)
from backend.app.services.claim_extractor import claim_extractor
from backend.app.services.tavily_service import tavily_service
from backend.app.services.evidence_comparator import evidence_comparator
from backend.app.config import settings

logger = logging.getLogger("truthlens.pipeline")

class PipelineCoordinator:
    """Coordinates the full TruthLens AI verification workflow."""

    async def run_verification(
        self,
        db: Session,
        input_text: str,
        original_question: Optional[str] = None,
        category: str = "Technology",
        verification_mode: str = "standard"
    ) -> VerificationRun:
        """
        Executes end-to-end verification:
        1. Extract claims & risk (Bifrost)
        2. Search live web evidence for each claim (Tavily)
        3. Compare evidence & compute freshness scores (Bifrost + Formula)
        4. Save to Database
        """
        # Validate that required keys are present
        if not settings.BIFROST_API_KEY:
            raise ValueError(
                "BIFROST_API_KEY is not configured. Please enter your Bifrost API Key in Settings to run AI verification."
            )
        if not settings.TAVILY_API_KEY:
            raise ValueError(
                "TAVILY_API_KEY is not configured. Please enter your Tavily API Key in Settings to fetch live web evidence."
            )

        logger.info(f"Starting verification pipeline (mode={verification_mode}, category={category})...")

        # 1. Create Verification Run in DB
        run = VerificationRun(
            id=generate_uuid(),
            input_text=input_text,
            original_question=original_question,
            category=category,
            verification_mode=verification_mode,
            overall_score=0.0,
            total_claims=0
        )
        db.add(run)
        db.flush()

        # 2. Extract Claims via Bifrost
        claims_data, extract_usage = await claim_extractor.extract_claims(
            input_text=input_text,
            category_hint=category,
            verification_mode=verification_mode
        )

        # Log extraction model usage
        extract_model_usage = ModelUsage(
            id=generate_uuid(),
            run_id=run.id,
            model_name=extract_usage.get("model_name", "bifrost"),
            input_tokens=extract_usage.get("input_tokens", 0),
            output_tokens=extract_usage.get("output_tokens", 0),
            latency_ms=extract_usage.get("latency_ms", 0.0),
            provider=extract_usage.get("provider", "bifrost")
        )
        db.add(extract_model_usage)

        if not claims_data:
            run.overall_score = 100.0
            run.total_claims = 0
            db.commit()
            db.refresh(run)
            return run

        # 3. For each claim, retrieve evidence & evaluate
        total_freshness_scores = []
        max_evidence = 3 if verification_mode == "quick" else (5 if verification_mode == "standard" else 8)
        search_depth = "basic" if verification_mode == "quick" else "advanced"

        for claim_dict in claims_data:
            claim_obj = Claim(
                id=generate_uuid(),
                run_id=run.id,
                claim_text=claim_dict["claim_text"],
                category=claim_dict.get("category", category),
                risk_level=claim_dict.get("risk_level", "MEDIUM"),
                time_sensitive=claim_dict.get("time_sensitive", False)
            )
            db.add(claim_obj)
            db.flush()

            # Retrieve evidence from Tavily
            search_query = claim_dict.get("search_query") or claim_dict["claim_text"]
            try:
                evidence_items = await tavily_service.search_claim(
                    claim_text=search_query,
                    search_depth=search_depth,
                    max_results=max_evidence
                )
            except Exception as e:
                logger.error(f"Tavily search failed for claim '{claim_dict['claim_text']}': {e}")
                evidence_items = []

            # Save Evidence to DB
            for ev in evidence_items:
                ev_obj = Evidence(
                    id=generate_uuid(),
                    claim_id=claim_obj.id,
                    title=ev["title"],
                    url=ev["url"],
                    snippet=ev["snippet"],
                    published_date=ev.get("published_date"),
                    source_type=ev.get("source_type", "web")
                )
                db.add(ev_obj)

            # Evaluate Claim against Evidence via Bifrost
            eval_dict, eval_usage = await evidence_comparator.evaluate_claim(
                claim_text=claim_obj.claim_text,
                category=claim_obj.category,
                risk_level=claim_obj.risk_level,
                time_sensitive=claim_obj.time_sensitive,
                evidence_list=evidence_items
            )

            # Record model usage for evaluation
            if eval_usage.get("model_name") != "rule-engine":
                eval_model_usage = ModelUsage(
                    id=generate_uuid(),
                    run_id=run.id,
                    model_name=eval_usage.get("model_name", "bifrost"),
                    input_tokens=eval_usage.get("input_tokens", 0),
                    output_tokens=eval_usage.get("output_tokens", 0),
                    latency_ms=eval_usage.get("latency_ms", 0.0),
                    provider=eval_usage.get("provider", "bifrost")
                )
                db.add(eval_model_usage)

            # Save Evaluation to DB
            evaluation_obj = Evaluation(
                id=generate_uuid(),
                claim_id=claim_obj.id,
                status=eval_dict["status"],
                freshness_score=eval_dict["freshness_score"],
                agreement_score=eval_dict["agreement_score"],
                reliability_score=eval_dict["reliability_score"],
                recency_score=eval_dict["recency_score"],
                diversity_score=eval_dict["diversity_score"],
                explanation=eval_dict["explanation"],
                correction_suggestion=eval_dict.get("correction_suggestion")
            )
            db.add(evaluation_obj)

            total_freshness_scores.append(eval_dict["freshness_score"])

        # 4. Finalize overall run metrics
        run.total_claims = len(claims_data)
        if total_freshness_scores:
            run.overall_score = round(sum(total_freshness_scores) / len(total_freshness_scores), 1)
        else:
            run.overall_score = 0.0

        db.commit()
        db.refresh(run)
        logger.info(f"Verification run {run.id} completed. Overall score: {run.overall_score}")
        return run

pipeline_coordinator = PipelineCoordinator()
