import uuid
from datetime import datetime, timedelta
from backend.app.database import SessionLocal, init_db
from backend.app.models.schema_models import (
    VerificationRun,
    Claim,
    Evidence,
    Evaluation,
    ModelUsage,
    generate_uuid
)

def seed_database():
    init_db()
    db = SessionLocal()

    # Check if runs already exist
    existing_count = db.query(VerificationRun).count()
    if existing_count > 0:
        print(f"Database already seeded ({existing_count} runs exist).")
        db.close()
        return

    print("Seeding initial benchmark & demonstration verification runs...")

    # --- RUN 1: Demonstration Scenario from Prompt ---
    run1 = VerificationRun(
        id=generate_uuid(),
        input_text=(
            "Python 3.11 is the latest stable Python version. Company XYZ currently has "
            "10,000 employees. The latest version of Product ABC costs $20 per month."
        ),
        original_question="What is the latest status of Python releases and XYZ company data?",
        category="Software and APIs",
        verification_mode="standard",
        overall_score=42.3,
        total_claims=3,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(run1)
    db.flush()

    # Claim 1.1: Python 3.11
    c1 = Claim(
        id=generate_uuid(),
        run_id=run1.id,
        claim_text="Python 3.11 is the latest stable Python version.",
        category="Software and APIs",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run1.created_at
    )
    db.add(c1)
    db.flush()

    ev1_1 = Evidence(
        id=generate_uuid(),
        claim_id=c1.id,
        title="Python 3.13.0 Release Announcement",
        url="https://docs.python.org/3/whatsnew/3.13.html",
        snippet="Python 3.13 is the newest major release of the Python programming language, offering significant performance improvements and free-threaded mode.",
        published_date="2024-10-07",
        source_type="official"
    )
    ev1_2 = Evidence(
        id=generate_uuid(),
        claim_id=c1.id,
        title="Python Release Schedule - PEP 719",
        url="https://peps.python.org/pep-0719/",
        snippet="PEP 719 defines the timeline for Python 3.13. Python 3.11 was released in October 2022 and is now in security-only maintenance mode.",
        published_date="2024-10-15",
        source_type="official"
    )
    db.add_all([ev1_1, ev1_2])

    eval1 = Evaluation(
        id=generate_uuid(),
        claim_id=c1.id,
        status="POTENTIALLY_STALE",
        freshness_score=36.4,
        agreement_score=15.0,
        reliability_score=95.0,
        recency_score=25.0,
        diversity_score=68.0,
        explanation=(
            "The statement that Python 3.11 is the latest stable version is outdated. "
            "Python 3.12 and subsequently Python 3.13 have been released as stable versions on python.org. "
            "Python 3.11 was superseded as the active latest release in late 2023.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 15.0) + 0.25*(R: 95.0) + 0.25*(T: 25.0) + 0.10*(D: 68.0) = 36.4/100."
        ),
        correction_suggestion=(
            "Python 3.13 is the latest stable release series of Python as of late 2024/2025."
        ),
        created_at=run1.created_at
    )
    db.add(eval1)

    # Claim 1.2: Company XYZ
    c2 = Claim(
        id=generate_uuid(),
        run_id=run1.id,
        claim_text="Company XYZ currently has 10,000 employees.",
        category="Business",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run1.created_at
    )
    db.add(c2)
    db.flush()

    eval2 = Evaluation(
        id=generate_uuid(),
        claim_id=c2.id,
        status="UNVERIFIED",
        freshness_score=0.0,
        agreement_score=0.0,
        reliability_score=0.0,
        recency_score=0.0,
        diversity_score=0.0,
        explanation="No reliable corporate directory or live business filing corroborates 'Company XYZ' with 10,000 employees.",
        correction_suggestion=None,
        created_at=run1.created_at
    )
    db.add(eval2)

    # Claim 1.3: Product ABC pricing
    c3 = Claim(
        id=generate_uuid(),
        run_id=run1.id,
        claim_text="The latest version of Product ABC costs $20 per month.",
        category="Software and APIs",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run1.created_at
    )
    db.add(c3)
    db.flush()

    eval3 = Evaluation(
        id=generate_uuid(),
        claim_id=c3.id,
        status="UNVERIFIED",
        freshness_score=0.0,
        agreement_score=0.0,
        reliability_score=0.0,
        recency_score=0.0,
        diversity_score=0.0,
        explanation="Product ABC is a placeholder entity with no official pricing registry found.",
        correction_suggestion=None,
        created_at=run1.created_at
    )
    db.add(eval3)

    # Usage for Run 1
    u1 = ModelUsage(
        id=generate_uuid(),
        run_id=run1.id,
        model_name="gpt-4o-mini",
        input_tokens=420,
        output_tokens=185,
        latency_ms=920.5,
        provider="Maxim AI Bifrost",
        created_at=run1.created_at
    )
    db.add(u1)

    # --- RUN 2: AI & Cloud Computing Verification ---
    run2 = VerificationRun(
        id=generate_uuid(),
        input_text=(
            "OpenAI released GPT-4 in March 2023. Sundar Pichai is the CEO of Alphabet Inc. "
            "Guido van Rossum first released Python in 1991."
        ),
        original_question="Can you give me key facts about AI and modern tech leadership?",
        category="Technology",
        verification_mode="standard",
        overall_score=94.2,
        total_claims=3,
        created_at=datetime.utcnow() - timedelta(hours=12)
    )
    db.add(run2)
    db.flush()

    # Claim 2.1: GPT-4 release
    c2_1 = Claim(
        id=generate_uuid(),
        run_id=run2.id,
        claim_text="OpenAI released GPT-4 in March 2023.",
        category="Technology",
        risk_level="LOW",
        time_sensitive=False,
        created_at=run2.created_at
    )
    db.add(c2_1)
    db.flush()

    ev2_1 = Evidence(
        id=generate_uuid(),
        claim_id=c2_1.id,
        title="GPT-4 Research Announcement",
        url="https://openai.com/index/gpt-4-research/",
        snippet="We've created GPT-4, the latest milestone in OpenAI's effort in scaling up deep learning. Released on March 14, 2023.",
        published_date="2023-03-14",
        source_type="official"
    )
    db.add(ev2_1)

    eval2_1 = Evaluation(
        id=generate_uuid(),
        claim_id=c2_1.id,
        status="VERIFIED",
        freshness_score=93.5,
        agreement_score=100.0,
        reliability_score=95.0,
        recency_score=85.0,
        diversity_score=75.0,
        explanation=(
            "The statement is historically accurate. OpenAI officially announced and released GPT-4 on March 14, 2023.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 100.0) + 0.25*(R: 95.0) + 0.25*(T: 85.0) + 0.10*(D: 75.0) = 93.5/100."
        ),
        correction_suggestion=None,
        created_at=run2.created_at
    )
    db.add(eval2_1)

    # Claim 2.2: Sundar Pichai CEO
    c2_2 = Claim(
        id=generate_uuid(),
        run_id=run2.id,
        claim_text="Sundar Pichai is the CEO of Alphabet Inc.",
        category="Business",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run2.created_at
    )
    db.add(c2_2)
    db.flush()

    ev2_2 = Evidence(
        id=generate_uuid(),
        claim_id=c2_2.id,
        title="Alphabet Investor Relations - Executive Officers",
        url="https://abc.xyz/investor/leadership/",
        snippet="Sundar Pichai is Chief Executive Officer of Alphabet and Google, and serves on Alphabet's Board of Directors.",
        published_date="2024-08-01",
        source_type="official"
    )
    db.add(ev2_2)

    eval2_2 = Evaluation(
        id=generate_uuid(),
        claim_id=c2_2.id,
        status="VERIFIED",
        freshness_score=95.0,
        agreement_score=100.0,
        reliability_score=95.0,
        recency_score=90.0,
        diversity_score=80.0,
        explanation=(
            "Confirmed. Sundar Pichai continues to serve as the active Chief Executive Officer of Alphabet Inc and Google LLC.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 100.0) + 0.25*(R: 95.0) + 0.25*(T: 90.0) + 0.10*(D: 80.0) = 95.0/100."
        ),
        correction_suggestion=None,
        created_at=run2.created_at
    )
    db.add(eval2_2)

    # Claim 2.3: Guido van Rossum
    c2_3 = Claim(
        id=generate_uuid(),
        run_id=run2.id,
        claim_text="Guido van Rossum first released Python in 1991.",
        category="Technology",
        risk_level="LOW",
        time_sensitive=False,
        created_at=run2.created_at
    )
    db.add(c2_3)
    db.flush()

    ev2_3 = Evidence(
        id=generate_uuid(),
        claim_id=c2_3.id,
        title="A Brief History of Python",
        url="https://docs.python.org/3/faq/general.html",
        snippet="Python was conceived in the late 1980s and its implementation began in December 1989 by Guido van Rossum in the Netherlands. It was first released in February 1991.",
        published_date="2024-01-01",
        source_type="official"
    )
    db.add(ev2_3)

    eval2_3 = Evaluation(
        id=generate_uuid(),
        claim_id=c2_3.id,
        status="VERIFIED",
        freshness_score=94.0,
        agreement_score=100.0,
        reliability_score=95.0,
        recency_score=90.0,
        diversity_score=70.0,
        explanation=(
            "Historically verified. Python 0.9.0 was posted to alt.sources by Guido van Rossum in February 1991.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 100.0) + 0.25*(R: 95.0) + 0.25*(T: 90.0) + 0.10*(D: 70.0) = 94.0/100."
        ),
        correction_suggestion=None,
        created_at=run2.created_at
    )
    db.add(eval2_3)

    u2 = ModelUsage(
        id=generate_uuid(),
        run_id=run2.id,
        model_name="gpt-4o-mini",
        input_tokens=510,
        output_tokens=220,
        latency_ms=1150.2,
        provider="Maxim AI Bifrost",
        created_at=run2.created_at
    )
    db.add(u2)

    # --- RUN 3: Contradicted Tech & Regulation Claims ---
    run3 = VerificationRun(
        id=generate_uuid(),
        input_text=(
            "Windows 7 is currently Microsoft's active flagship OS with full security patches. "
            "Boris Johnson is currently the UK Prime Minister."
        ),
        original_question="Check current operating system and UK political status.",
        category="Government and Regulations",
        verification_mode="standard",
        overall_score=21.5,
        total_claims=2,
        created_at=datetime.utcnow() - timedelta(days=1, hours=4)
    )
    db.add(run3)
    db.flush()

    c3_1 = Claim(
        id=generate_uuid(),
        run_id=run3.id,
        claim_text="Windows 7 is currently Microsoft's active flagship OS with full security patches.",
        category="Software and APIs",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run3.created_at
    )
    db.add(c3_1)
    db.flush()

    ev3_1 = Evidence(
        id=generate_uuid(),
        claim_id=c3_1.id,
        title="Windows 7 Support Ended on January 14, 2020",
        url="https://support.microsoft.com/en-us/windows/windows-7-support-ended-on-january-14-2020-bbaedd36-1e62-4752-944e-a10c28308836",
        snippet="After 10 years, support for Windows 7 ended on January 14, 2020. Microsoft strongly recommends transitioning to Windows 11.",
        published_date="2020-01-14",
        source_type="official"
    )
    db.add(ev3_1)

    eval3_1 = Evaluation(
        id=generate_uuid(),
        claim_id=c3_1.id,
        status="CONTRADICTED",
        freshness_score=22.0,
        agreement_score=0.0,
        reliability_score=95.0,
        recency_score=10.0,
        diversity_score=60.0,
        explanation=(
            "Contradicted. Microsoft officially ended support for Windows 7 on January 14, 2020. "
            "Windows 11 is Microsoft's active flagship desktop operating system.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 0.0) + 0.25*(R: 95.0) + 0.25*(T: 10.0) + 0.10*(D: 60.0) = 22.0/100."
        ),
        correction_suggestion="Windows 11 is Microsoft's current flagship operating system. Windows 7 reached End of Life in January 2020.",
        created_at=run3.created_at
    )
    db.add(eval3_1)

    c3_2 = Claim(
        id=generate_uuid(),
        run_id=run3.id,
        claim_text="Boris Johnson is currently the UK Prime Minister.",
        category="Government and Regulations",
        risk_level="HIGH",
        time_sensitive=True,
        created_at=run3.created_at
    )
    db.add(c3_2)
    db.flush()

    ev3_2 = Evidence(
        id=generate_uuid(),
        claim_id=c3_2.id,
        title="GOV.UK - Past Prime Ministers",
        url="https://www.gov.uk/government/history/past-prime-ministers",
        snippet="Boris Johnson served as Prime Minister from 2019 to 2022. Keir Starmer took office as Prime Minister in July 2024.",
        published_date="2024-07-05",
        source_type="government"
    )
    db.add(ev3_2)

    eval3_2 = Evaluation(
        id=generate_uuid(),
        claim_id=c3_2.id,
        status="CONTRADICTED",
        freshness_score=21.0,
        agreement_score=0.0,
        reliability_score=95.0,
        recency_score=20.0,
        diversity_score=60.0,
        explanation=(
            "Directly contradicted by UK official government records. Boris Johnson resigned in September 2022. "
            "Keir Starmer is the current Prime Minister.\n\n"
            "[Formula Breakdown]: F = 0.40*(A: 0.0) + 0.25*(R: 95.0) + 0.25*(T: 20.0) + 0.10*(D: 60.0) = 21.0/100."
        ),
        correction_suggestion="Keir Starmer is the current Prime Minister of the United Kingdom, having taken office in July 2024.",
        created_at=run3.created_at
    )
    db.add(eval3_2)

    u3 = ModelUsage(
        id=generate_uuid(),
        run_id=run3.id,
        model_name="gpt-4o-mini",
        input_tokens=480,
        output_tokens=210,
        latency_ms=1040.0,
        provider="Maxim AI Bifrost",
        created_at=run3.created_at
    )
    db.add(u3)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
