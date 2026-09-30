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
def test_invalid_payloads_are_rejected(client: TestClient, auth: dict[str, str], url: str, payload: dict) -> None:
    assert client.post(url, json=payload, headers=auth).status_code == 422


def test_protected_routes_answer_401_without_a_token() -> None:
    """Checked before validation: a bad payload on these routes still answers 401."""
    assert client.get("/purchase-orders").status_code == 401
    assert client.post("/purchase-orders", json={"reference": ""}).status_code == 401
    assert client.get("/stock-movements").status_code == 401


@pytest.mark.parametrize(
    ("method", "url"),
    [
        ("post", "/categories"),
        ("patch", "/categories/1"),
        ("delete", "/categories/1"),
        ("post", "/locations"),
        ("delete", "/locations/1"),
        ("get", "/locations/geocode?q=Paris"),
        ("post", "/suppliers"),
        ("delete", "/suppliers/1"),
        ("post", "/products"),
        ("patch", "/products/1"),
        ("get", "/products/lookup/3017620422003"),
        ("post", "/stocks"),
        ("patch", "/stocks/1"),
        ("delete", "/stocks/1"),
    ],
)
def test_write_routes_answer_401_without_a_token(client: TestClient, method: str, url: str) -> None:
    """Reads are public, every write (and every call to an external API) needs a token."""
    assert client.request(method, url, json={}).status_code == 401


def test_read_routes_stay_public(client: TestClient) -> None:
    for url in ("/categories", "/locations", "/suppliers", "/products", "/stocks"):
        assert client.get(url).status_code == 200


def test_valid_payload_reaches_the_route(client: TestClient, auth: dict[str, str]) -> None:
    """A valid payload passes validation, so the service answers on the unknown product."""
    payload = {"product_id": 1, "location_id": 1, "quantity": 5}
    response = client.post("/stocks", json=payload, headers=auth)
    assert response.status_code == 404
    assert response.json()["detail"] == "Produit introuvable"
