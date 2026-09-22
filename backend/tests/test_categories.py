from fastapi.testclient import TestClient


def create(client: TestClient, name: str = "Boissons", description: str | None = "Sirops et jus") -> dict:
    response = client.post("/categories", json={"name": name, "description": description})
    assert response.status_code == 201
    return response.json()


def test_create_category(client: TestClient) -> None:
    body = create(client)
    assert body["name"] == "Boissons"
    assert body["description"] == "Sirops et jus"
    assert isinstance(body["id"], int)


def test_create_category_rejects_duplicate_name(client: TestClient) -> None:
    create(client)
    response = client.post("/categories", json={"name": "Boissons", "description": "Autre"})
    assert response.status_code == 409


def test_create_category_rejects_empty_name(client: TestClient) -> None:
    response = client.post("/categories", json={"name": "", "description": None})
    assert response.status_code == 422


def test_list_categories(client: TestClient) -> None:
    create(client, name="Boissons")
    create(client, name="Sauces")

    response = client.get("/categories")
    assert response.status_code == 200
    names = {c["name"] for c in response.json()}
    assert names == {"Boissons", "Sauces"}


def test_get_category(client: TestClient) -> None:
    created = create(client)
    response = client.get(f"/categories/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_category_not_found(client: TestClient) -> None:
    response = client.get("/categories/999")
    assert response.status_code == 404


def test_update_category(client: TestClient) -> None:
    created = create(client)
    response = client.patch(f"/categories/{created['id']}", json={"name": "Boissons chaudes"})
    assert response.status_code == 200
    assert response.json()["name"] == "Boissons chaudes"
    assert response.json()["description"] == "Sirops et jus"


def test_update_category_not_found(client: TestClient) -> None:
    response = client.patch("/categories/999", json={"name": "Peu importe"})
    assert response.status_code == 404


def test_update_category_rejects_duplicate_name(client: TestClient) -> None:
    create(client, name="Boissons")
    other = create(client, name="Sauces")

    response = client.patch(f"/categories/{other['id']}", json={"name": "Boissons"})
    assert response.status_code == 409


def test_delete_category(client: TestClient) -> None:
    created = create(client)
    response = client.delete(f"/categories/{created['id']}")
    assert response.status_code == 204

    response = client.get(f"/categories/{created['id']}")
    assert response.status_code == 404


def test_delete_category_not_found(client: TestClient) -> None:
    response = client.delete("/categories/999")
    assert response.status_code == 404
