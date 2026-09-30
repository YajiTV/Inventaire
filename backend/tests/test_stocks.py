import pytest
from fastapi.testclient import TestClient

from tests.test_stock_movements import create_location, create_product

pytestmark = pytest.mark.usefixtures("authenticated")


def create_stock(client: TestClient, quantity: int = 5) -> dict:
    payload = {"product_id": create_product(client), "location_id": create_location(client), "quantity": quantity}
    response = client.post("/stocks", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_stock(client: TestClient) -> None:
    product_id = create_product(client)
    location_id = create_location(client)

    response = client.post("/stocks", json={"product_id": product_id, "location_id": location_id, "quantity": 7})
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["id"] > 0
    assert (body["product_id"], body["location_id"], body["quantity"]) == (product_id, location_id, 7)


def test_list_and_get_stock(client: TestClient) -> None:
    stock = create_stock(client)

    listed = client.get("/stocks")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [stock["id"]]

    response = client.get(f"/stocks/{stock['id']}")
    assert response.status_code == 200
    assert response.json() == stock


def test_update_stock_quantity(client: TestClient) -> None:
    stock = create_stock(client)

    response = client.patch(f"/stocks/{stock['id']}", json={"quantity": 12})
    assert response.status_code == 200
    assert response.json()["quantity"] == 12
    assert client.get(f"/stocks/{stock['id']}").json()["quantity"] == 12


def test_delete_stock(client: TestClient) -> None:
    stock = create_stock(client)

    assert client.delete(f"/stocks/{stock['id']}").status_code == 204
    assert client.get(f"/stocks/{stock['id']}").status_code == 404
    assert client.get("/stocks").json() == []


def test_create_stock_rejects_an_unknown_product(client: TestClient) -> None:
    location_id = create_location(client)

    response = client.post("/stocks", json={"product_id": 999, "location_id": location_id, "quantity": 1})
    assert response.status_code == 404
    assert response.json()["detail"] == "Produit introuvable"


def test_create_stock_rejects_an_unknown_location(client: TestClient) -> None:
    product_id = create_product(client)

    response = client.post("/stocks", json={"product_id": product_id, "location_id": 999, "quantity": 1})
    assert response.status_code == 404
    assert response.json()["detail"] == "Emplacement introuvable"


def test_create_stock_refuses_a_duplicate_product_and_location(client: TestClient) -> None:
    stock = create_stock(client)

    payload = {"product_id": stock["product_id"], "location_id": stock["location_id"], "quantity": 3}
    response = client.post("/stocks", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"] == "Un stock existe déjà pour ce produit à cet emplacement"


def test_negative_quantity_is_rejected(client: TestClient) -> None:
    stock = create_stock(client)

    payload = {"product_id": stock["product_id"], "location_id": stock["location_id"], "quantity": -1}
    assert client.post("/stocks", json=payload).status_code == 422
    assert client.patch(f"/stocks/{stock['id']}", json={"quantity": -1}).status_code == 422
    assert client.get(f"/stocks/{stock['id']}").json()["quantity"] == stock["quantity"]


def test_unknown_stock_returns_404(client: TestClient) -> None:
    response = client.get("/stocks/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Stock introuvable"
    assert client.patch("/stocks/999", json={"quantity": 1}).status_code == 404
    assert client.delete("/stocks/999").status_code == 404
