from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.stock import Stock


def create(client: TestClient, code: str = "A1", name: str = "Allee A1", description: str | None = "Rayon boissons") -> dict:
    response = client.post("/locations", json={"code": code, "name": name, "description": description})
    assert response.status_code == 201
    return response.json()


def test_create_location(client: TestClient) -> None:
    body = create(client)
    assert body["code"] == "A1"
    assert body["name"] == "Allee A1"
    assert isinstance(body["id"], int)


def test_create_location_rejects_duplicate_code(client: TestClient) -> None:
    create(client)
    response = client.post("/locations", json={"code": "A1", "name": "Autre", "description": None})
    assert response.status_code == 409


def test_create_location_rejects_invalid_code(client: TestClient) -> None:
    response = client.post("/locations", json={"code": "a1", "name": "Allee A1", "description": None})
    assert response.status_code == 422


def test_list_locations(client: TestClient) -> None:
    create(client, code="A1")
    create(client, code="A2")

    response = client.get("/locations")
    assert response.status_code == 200
    codes = {loc["code"] for loc in response.json()}
    assert codes == {"A1", "A2"}


def test_get_location(client: TestClient) -> None:
    created = create(client)
    response = client.get(f"/locations/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_location_not_found(client: TestClient) -> None:
    response = client.get("/locations/999")
    assert response.status_code == 404


def test_update_location(client: TestClient) -> None:
    created = create(client)
    response = client.patch(f"/locations/{created['id']}", json={"name": "Allee A1 bis"})
    assert response.status_code == 200
    assert response.json()["name"] == "Allee A1 bis"
    assert response.json()["code"] == "A1"


def test_update_location_not_found(client: TestClient) -> None:
    response = client.patch("/locations/999", json={"name": "Peu importe"})
    assert response.status_code == 404


def test_update_location_rejects_duplicate_code(client: TestClient) -> None:
    create(client, code="A1")
    other = create(client, code="A2")

    response = client.patch(f"/locations/{other['id']}", json={"code": "A1"})
    assert response.status_code == 409


def test_delete_location(client: TestClient) -> None:
    created = create(client)
    response = client.delete(f"/locations/{created['id']}")
    assert response.status_code == 204

    response = client.get(f"/locations/{created['id']}")
    assert response.status_code == 404


def test_delete_location_not_found(client: TestClient) -> None:
    response = client.delete("/locations/999")
    assert response.status_code == 404


def test_delete_location_rejects_when_stock_exists(client: TestClient, db_session: Session) -> None:
    created = create(client)
    db_session.add(Stock(product_id=1, location_id=created["id"], quantity=5))
    db_session.commit()

    response = client.delete(f"/locations/{created['id']}")
    assert response.status_code == 409


def test_list_location_stocks_empty(client: TestClient) -> None:
    created = create(client)
    response = client.get(f"/locations/{created['id']}/stocks")
    assert response.status_code == 200
    assert response.json() == []


def test_list_location_stocks(client: TestClient, db_session: Session) -> None:
    created = create(client)
    db_session.add(Stock(product_id=1, location_id=created["id"], quantity=5))
    db_session.add(Stock(product_id=2, location_id=created["id"], quantity=12))
    db_session.commit()

    response = client.get(f"/locations/{created['id']}/stocks")
    assert response.status_code == 200
    quantities = {row["product_id"]: row["quantity"] for row in response.json()}
    assert quantities == {1: 5, 2: 12}


def test_list_location_stocks_not_found(client: TestClient) -> None:
    response = client.get("/locations/999/stocks")
    assert response.status_code == 404
