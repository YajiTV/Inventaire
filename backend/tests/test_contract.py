import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from scripts.export_openapi import OPENAPI_PATH

client = TestClient(app)


def test_exported_openapi_is_up_to_date() -> None:
    """
    The frontend derives its types from openapi.json.
    If this test fails: run ".venv/bin/python -m scripts.export_openapi" and commit.
    """
    exported = json.loads(OPENAPI_PATH.read_text())
    assert exported == json.loads(json.dumps(app.openapi()))


@pytest.mark.parametrize(
    ("url", "payload"),
    [
        ("/categories", {"name": ""}),
        ("/locations", {"code": "zone 1", "name": "Zone 1"}),
        ("/products", {"sku": "P-1", "name": "Vis", "unit_price": -1, "category_id": 1}),
    ],
)
def test_invalid_payloads_are_rejected(url: str, payload: dict) -> None:
    assert client.post(url, json=payload).status_code == 422


def test_protected_routes_answer_401_without_a_token() -> None:
    """Checked before validation: a bad payload on these routes still answers 401."""
    assert client.get("/purchase-orders").status_code == 401
    assert client.post("/purchase-orders", json={"reference": ""}).status_code == 401
    assert client.get("/stock-movements").status_code == 401


def test_valid_payload_reaches_the_route() -> None:
    """A valid payload passes validation, so it fails on the missing implementation."""
    payload = {"product_id": 1, "location_id": 1, "quantity": 5}
    assert client.post("/stocks", json=payload).status_code == 501
