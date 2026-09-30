from fastapi.testclient import TestClient

from app.core.security import settings


def register_and_login(client: TestClient, email: str = "op@inventaire.fr") -> str:
    client.post("/auth/register", json={"email": email, "full_name": "Operateur Test", "password": "s3cret-pass"})
    response = client.post("/auth/login", json={"email": email, "password": "s3cret-pass"})
    assert response.status_code == 200
    return response.cookies[settings.refresh_cookie_name]


def test_refresh_rotates_the_cookie(client: TestClient) -> None:
    first_token = register_and_login(client)
    response = client.post("/auth/refresh")
    assert response.status_code == 200

    second_token = response.cookies[settings.refresh_cookie_name]
    assert second_token != first_token


def test_a_rotated_refresh_token_cannot_be_reused(client: TestClient) -> None:
    first_token = register_and_login(client)
    assert client.post("/auth/refresh").status_code == 200

    # The client's cookie jar now holds the new token; force the old one back
    # in to simulate someone replaying an intercepted cookie.
    client.cookies.set(settings.refresh_cookie_name, first_token)
    assert client.post("/auth/refresh").status_code == 401


def test_reusing_an_old_token_revokes_the_current_session_too(client: TestClient) -> None:
    first_token = register_and_login(client)
    refreshed = client.post("/auth/refresh")
    current_token = refreshed.cookies[settings.refresh_cookie_name]

    # Replay the old token: this is treated as a theft signal.
    client.cookies.set(settings.refresh_cookie_name, first_token)
    assert client.post("/auth/refresh").status_code == 401

    # The legitimate, still-current token is a casualty of that response:
    # every session was revoked, not only the reused one.
    client.cookies.set(settings.refresh_cookie_name, current_token)
    assert client.post("/auth/refresh").status_code == 401


def test_logout_revokes_the_token_in_database_not_only_the_cookie(client: TestClient) -> None:
    token = register_and_login(client)
    assert client.post("/auth/logout").status_code == 204

    # Put the (now revoked) cookie back by hand: even presented again, it
    # must not work, proving the cookie deletion is not what protects this.
    client.cookies.set(settings.refresh_cookie_name, token)
    assert client.post("/auth/refresh").status_code == 401


def test_refresh_without_cookie_is_still_unauthorized(client: TestClient) -> None:
    assert client.post("/auth/refresh").status_code == 401


def test_garbage_refresh_cookie_is_unauthorized(client: TestClient) -> None:
    client.cookies.set(settings.refresh_cookie_name, "not-a-real-token")
    assert client.post("/auth/refresh").status_code == 401
