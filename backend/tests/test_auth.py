from fastapi.testclient import TestClient


def register(client: TestClient, email: str = "op@inventaire.fr", password: str = "s3cret-pass", role: str = "operator") -> None:
    response = client.post(
        "/users",
        json={"email": email, "full_name": "Operateur Test", "password": password, "role": role},
    )
    assert response.status_code == 201


def test_register_creates_user_with_forced_operator_role(client: TestClient) -> None:
    response = client.post(
        "/users",
        json={"email": "wannabe-admin@inventaire.fr", "full_name": "Tentative", "password": "s3cret-pass", "role": "admin"},
    )
    assert response.status_code == 201
    assert response.json()["role"] == "operator"


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    register(client)
    response = client.post(
        "/users",
        json={"email": "op@inventaire.fr", "full_name": "Autre", "password": "s3cret-pass"},
    )
    assert response.status_code == 409


def test_login_returns_access_token_and_sets_refresh_cookie(client: TestClient) -> None:
    register(client)
    response = client.post("/auth/login", json={"email": "op@inventaire.fr", "password": "s3cret-pass"})
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 900
    assert "refresh_token" in response.cookies


def test_login_rejects_wrong_password(client: TestClient) -> None:
    register(client)
    response = client.post("/auth/login", json={"email": "op@inventaire.fr", "password": "wrong-pass"})
    assert response.status_code == 401


def test_me_requires_bearer_token(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user_with_valid_token(client: TestClient) -> None:
    register(client)
    login_response = client.post("/auth/login", json={"email": "op@inventaire.fr", "password": "s3cret-pass"})
    access_token = login_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "op@inventaire.fr"


def test_refresh_issues_new_access_token_from_cookie(client: TestClient) -> None:
    register(client)
    client.post("/auth/login", json={"email": "op@inventaire.fr", "password": "s3cret-pass"})

    response = client.post("/auth/refresh")
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_without_cookie_is_unauthorized(client: TestClient) -> None:
    response = client.post("/auth/refresh")
    assert response.status_code == 401


def test_logout_clears_refresh_cookie(client: TestClient) -> None:
    register(client)
    client.post("/auth/login", json={"email": "op@inventaire.fr", "password": "s3cret-pass"})

    response = client.post("/auth/logout")
    assert response.status_code == 204

    refresh_response = client.post("/auth/refresh")
    assert refresh_response.status_code == 401
