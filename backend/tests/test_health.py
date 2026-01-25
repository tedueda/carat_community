from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test root endpoint returns correct response"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "LGBTQ Community API", "version": "1.0.0"}

def test_healthz():
    """Test healthz endpoint"""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_docs():
    """Test docs endpoint is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200
