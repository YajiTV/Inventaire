import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def _authenticated(client: TestClient, auth: dict[str, str]) -> None:
    """Every purchase order route needs a token, helpers below included."""
    client.headers.update(auth)


def test_purchase_orders_require_authentication(client: TestClient) -> None:
    client.headers.pop("Authorization")
    assert client.get("/purchase-orders").status_code == 401
    assert client.post("/purchase-orders", json={}).status_code == 401


def create_supplier(client: TestClient, name: str = "Metro") -> int:
    response = client.post("/suppliers", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


def create_location(client: TestClient, code: str = "ZONE-A") -> int:
    response = client.post("/locations", json={"code": code, "name": "Zone A"})
    assert response.status_code == 201
    return response.json()["id"]


def create_product(client: TestClient, sku: str = "CAFE-001") -> int:
    category = client.post("/categories", json={"name": f"Categorie {sku}", "description": None})
    assert category.status_code == 201
    response = client.post(
        "/products",
        json={
            "sku": sku,
            "name": "Cafe moulu",
            "unit_price": "12.50",
            "category_id": category.json()["id"],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def create_order(client: TestClient, reference: str = "CMD-0001", **overrides) -> dict:
    payload = {
        "reference": reference,
        "supplier_id": create_supplier(client, name=f"Fournisseur {reference}"),
        "location_id": create_location(client, code=f"Z-{reference}"),
        "lines": [{"product_id": create_product(client, sku=f"SKU-{reference}"), "quantity": 3, "unit_price": "12.50"}],
    }
    payload.update(overrides)
    response = client.post("/purchase-orders", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_purchase_order_starts_as_draft(client: TestClient) -> None:
    body = create_order(client)
    assert body["status"] == "draft"
    assert body["received_at"] is None
    assert len(body["lines"]) == 1


def test_create_purchase_order_totals_its_lines(client: TestClient) -> None:
    body = create_order(
        client,
        lines=[
            {"product_id": create_product(client, sku="CAFE-001"), "quantity": 3, "unit_price": "12.50"},
            {"product_id": create_product(client, sku="CAFE-002"), "quantity": 2, "unit_price": "1.25"},
        ],
    )
    assert float(body["total_price"]) == 40.0


def test_create_purchase_order_rejects_duplicate_reference(client: TestClient) -> None:
    create_order(client)
    response = client.post(
        "/purchase-orders",
        json={
            "reference": "CMD-0001",
            "supplier_id": create_supplier(client, name="Autre"),
            "location_id": create_location(client, code="ZONE-B"),
            "lines": [{"product_id": create_product(client, sku="AUTRE-001"), "quantity": 1, "unit_price": "1.00"}],
        },
    )
    assert response.status_code == 409


def test_create_purchase_order_rejects_unknown_supplier(client: TestClient) -> None:
    response = client.post(
        "/purchase-orders",
        json={
            "reference": "CMD-0002",
            "supplier_id": 999,
            "location_id": create_location(client),
            "lines": [{"product_id": create_product(client), "quantity": 1, "unit_price": "1.00"}],
        },
    )
    assert response.status_code == 404


def test_create_purchase_order_rejects_unknown_product(client: TestClient) -> None:
    response = client.post(
        "/purchase-orders",
        json={
            "reference": "CMD-0004",
            "supplier_id": create_supplier(client),
            "location_id": create_location(client),
            "lines": [{"product_id": 999, "quantity": 1, "unit_price": "1.00"}],
        },
    )
    assert response.status_code == 404


def test_create_purchase_order_rejects_empty_lines(client: TestClient) -> None:
    response = client.post(
        "/purchase-orders",
        json={
            "reference": "CMD-0003",
            "supplier_id": create_supplier(client),
            "location_id": create_location(client),
            "lines": [],
        },
    )
    assert response.status_code == 422


def test_list_purchase_orders_filters_by_status(client: TestClient) -> None:
    sent = create_order(client, reference="CMD-0010")
    create_order(client, reference="CMD-0011")
    assert client.patch(f"/purchase-orders/{sent['id']}", json={"status": "sent"}).status_code == 200

    response = client.get("/purchase-orders", params={"order_status": "sent"})
    assert response.status_code == 200
    assert [order["reference"] for order in response.json()] == ["CMD-0010"]


def test_get_unknown_purchase_order_returns_404(client: TestClient) -> None:
    assert client.get("/purchase-orders/999").status_code == 404


def test_status_follows_the_life_cycle(client: TestClient) -> None:
    order_id = create_order(client)["id"]

    sent = client.patch(f"/purchase-orders/{order_id}", json={"status": "sent"})
    assert sent.status_code == 200
    assert sent.json()["received_at"] is None

    received = client.patch(f"/purchase-orders/{order_id}", json={"status": "received"})
    assert received.status_code == 200
    assert received.json()["status"] == "received"
    assert received.json()["received_at"] is not None


def test_status_refuses_an_invalid_transition(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    # draft -> received skips the "sent" step
    assert client.patch(f"/purchase-orders/{order_id}", json={"status": "received"}).status_code == 409


def test_status_refuses_to_reopen_a_closed_order(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    assert client.patch(f"/purchase-orders/{order_id}", json={"status": "cancelled"}).status_code == 200
    assert client.patch(f"/purchase-orders/{order_id}", json={"status": "sent"}).status_code == 409


def test_location_cannot_change_once_the_order_is_closed(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    other_location = create_location(client, code="ZONE-C")
    assert client.patch(f"/purchase-orders/{order_id}", json={"status": "cancelled"}).status_code == 200

    response = client.patch(f"/purchase-orders/{order_id}", json={"location_id": other_location})
    assert response.status_code == 409


def test_delete_draft_order_removes_its_lines(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    assert client.delete(f"/purchase-orders/{order_id}").status_code == 204
    assert client.get(f"/purchase-orders/{order_id}").status_code == 404


def test_delete_refuses_a_sent_order(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    assert client.patch(f"/purchase-orders/{order_id}", json={"status": "sent"}).status_code == 200
    assert client.delete(f"/purchase-orders/{order_id}").status_code == 409


def test_order_lines_sub_resource_is_not_implemented_yet(client: TestClient) -> None:
    order_id = create_order(client)["id"]
    assert client.get(f"/purchase-orders/{order_id}/lines").status_code == 501
