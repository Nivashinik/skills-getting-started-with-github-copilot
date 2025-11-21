import copy
import pytest
from fastapi.testclient import TestClient

import src.app as app_module


client = TestClient(app_module.app)

# Keep an original copy of the activities so tests can reset
original_activities = copy.deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def reset_activities():
    # Reset in-memory activities before each test
    app_module.activities = copy.deepcopy(original_activities)
    yield
    app_module.activities = copy.deepcopy(original_activities)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    email = "testuser@example.com"
    activity = "Chess Club"

    # Initially not present
    resp = client.get("/activities")
    assert email not in resp.json()[activity]["participants"]

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json()["message"]

    # Now should be present
    resp = client.get("/activities")
    assert email in resp.json()[activity]["participants"]

    # Duplicate signup should return 400
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400

    # Unregister
    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 200
    assert "Unregistered" in resp.json()["message"]

    # Now absent again
    resp = client.get("/activities")
    assert email not in resp.json()[activity]["participants"]


def test_unregister_nonexistent_returns_404():
    email = "nonexistent@example.com"
    activity = "Chess Club"
    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 404
