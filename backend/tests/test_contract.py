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
        ("/stock-movements", {"product_id": 1, "type": "in", "quantity": 0}),
        (
            "/stock-movements",
            {
                "product_id": 1,
                "type": "transfer",
                "quantity": 5,
                "source_location_id": 1,
                "target_location_id": 1,
            },
        ),
        ("/purchase-orders", {"reference": "CMD-1", "supplier_id": 1, "location_id": 1, "lines": []}),
    ],
)
def test_invalid_payloads_are_rejected(url: str, payload: dict) -> None:
    assert client.post(url, json=payload).status_code == 422


def test_valid_payload_reaches_the_route() -> None:
    """A valid payload passes validation, so it fails on the missing implementation."""
    payload = {
        "product_id": 1,
        "type": "transfer",
        "quantity": 5,
        "source_location_id": 1,
        "target_location_id": 2,
    }
    assert client.post("/stock-movements", json=payload).status_code == 501
