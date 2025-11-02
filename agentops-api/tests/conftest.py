"""
Pytest configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def mock_user():
    """Mock user data for testing"""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "full_name": "Test User"
    }


@pytest.fixture
def mock_api_key():
    """Mock API key for testing"""
    return "agops_test_key_123456789"

