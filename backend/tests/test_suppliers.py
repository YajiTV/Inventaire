import pytest
from fastapi.testclient import TestClient

# Tests API du CRUD Fournisseurs : chaque test part d'une base vide (fixture "client" de conftest.py)

pytestmark = pytest.mark.usefixtures("authenticated")


# Crée un fournisseur via l'API et renvoie le JSON de la réponse
def create(client: TestClient, name: str = "Brasserie du Nord", email: str | None = "contact@brasserie.fr") -> dict:
    response = client.post("/suppliers", json={"name": name, "email": email, "phone": "0320000000"})
    assert response.status_code == 201
    return response.json()


def test_create_supplier(client: TestClient) -> None:
    body = create(client)
    assert body["name"] == "Brasserie du Nord"
    assert body["email"] == "contact@brasserie.fr"
    assert body["address"] is None
    assert isinstance(body["id"], int)


def test_create_supplier_rejects_empty_name(client: TestClient) -> None:
    response = client.post("/suppliers", json={"name": ""})
    assert response.status_code == 422


def test_create_supplier_rejects_invalid_email(client: TestClient) -> None:
    response = client.post("/suppliers", json={"name": "Brasserie", "email": "pas-un-email"})
    assert response.status_code == 422


def test_list_suppliers(client: TestClient) -> None:
    create(client, name="Brasserie du Nord")
    create(client, name="Moulin de Paris")

    response = client.get("/suppliers")
    assert response.status_code == 200
    names = {s["name"] for s in response.json()}
    assert names == {"Brasserie du Nord", "Moulin de Paris"}


def test_get_supplier(client: TestClient) -> None:
    created = create(client)
    response = client.get(f"/suppliers/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_supplier_not_found(client: TestClient) -> None:
    response = client.get("/suppliers/999")
    assert response.status_code == 404


def test_update_supplier_changes_only_sent_fields(client: TestClient) -> None:
    created = create(client)
    response = client.patch(f"/suppliers/{created['id']}", json={"name": "Brasserie du Sud"})
    assert response.status_code == 200
    assert response.json()["name"] == "Brasserie du Sud"
    # Le PATCH ne touche pas aux champs non envoyés
    assert response.json()["email"] == "contact@brasserie.fr"


def test_update_supplier_not_found(client: TestClient) -> None:
    response = client.patch("/suppliers/999", json={"name": "Peu importe"})
    assert response.status_code == 404


def test_delete_supplier(client: TestClient) -> None:
    created = create(client)
    response = client.delete(f"/suppliers/{created['id']}")
    assert response.status_code == 204

    response = client.get(f"/suppliers/{created['id']}")
    assert response.status_code == 404


def test_delete_supplier_not_found(client: TestClient) -> None:
    response = client.delete("/suppliers/999")
    assert response.status_code == 404
