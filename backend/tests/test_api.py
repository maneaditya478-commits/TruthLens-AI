import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()

def test_health():
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["database"] == "connected"
    assert "integrations" in data

def test_settings():
    client = TestClient(app)
    res = client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert "bifrost_base_url" in data

def test_benchmark_dataset():
    client = TestClient(app)
    res = client.get("/api/benchmark/dataset")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 20
    assert data[0]["id"] == "claim-01"

def test_history():
    client = TestClient(app)
    res = client.get("/api/history")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_dashboard_stats():
    client = TestClient(app)
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    stats = res.json()
    assert "status_distribution" in stats
