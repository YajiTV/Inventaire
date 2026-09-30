from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, settings
from app.models.user import User
from app.schemas.enums import UserRole
from app.services.password import hash_password

# One route per protected area: auth, users (admin), orders, replenishment.
PROTECTED_ROUTES = ["/auth/me", "/users", "/purchase-orders", "/replenishment/suggestions"]


def forge_token(user_id: int, token_type: str = "access", expires_in: timedelta = timedelta(minutes=5), secret: str | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "type": token_type, "iat": now, "exp": now + expires_in}
    return jwt.encode(payload, secret or settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_user(db_session: Session, email: str = "op@inventaire.fr", is_active: bool = True) -> User:
    user = User(
        email=email,
        full_name="Operateur Test",
        hashed_password=hash_password("s3cret-pass"),
        role=UserRole.OPERATOR,
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.mark.parametrize("route", PROTECTED_ROUTES)
def test_no_token_is_rejected(client: TestClient, route: str) -> None:
    assert client.get(route).status_code == 401


@pytest.mark.parametrize("route", PROTECTED_ROUTES)
def test_expired_token_is_rejected(client: TestClient, db_session: Session, route: str) -> None:
    user = create_user(db_session)
    expired = forge_token(user.id, expires_in=timedelta(minutes=-1))
    response = client.get(route, headers=bearer(expired))
    assert response.status_code == 401
    assert response.json()["detail"] == "Token invalide"


@pytest.mark.parametrize("route", PROTECTED_ROUTES)
def test_garbage_token_is_rejected(client: TestClient, route: str) -> None:
    assert client.get(route, headers=bearer("not-a-jwt")).status_code == 401


def test_token_signed_with_another_secret_is_rejected(client: TestClient, db_session: Session) -> None:
    user = create_user(db_session)
    forged = forge_token(user.id, secret="another-secret-of-at-least-32-characters")
    assert client.get("/auth/me", headers=bearer(forged)).status_code == 401


def test_tampered_token_is_rejected(client: TestClient, db_session: Session) -> None:
    user = create_user(db_session)
    header, payload, signature = create_access_token(user.id).split(".")
    # Flip the first character of the signature: the payload is untouched, the signature no longer matches.
    # Not the last one: its low bits are base64 padding, so changing it can decode to the same bytes.
    tampered_signature = ("A" if signature[0] != "A" else "B") + signature[1:]
    tampered = ".".join([header, payload, tampered_signature])
    assert client.get("/auth/me", headers=bearer(tampered)).status_code == 401


def test_refresh_token_cannot_be_used_as_access_token(client: TestClient, db_session: Session) -> None:
    # The refresh cookie is an opaque random string, not a JWT: it fails the
    # very first step of decode_token, for a different reason than a
    # wrong-type JWT would, but the outcome must be the same, 401.
    user = create_user(db_session)
    login = client.post("/auth/login", json={"email": user.email, "password": "s3cret-pass"})
    raw_refresh_token = login.cookies[settings.refresh_cookie_name]
    assert client.get("/auth/me", headers=bearer(raw_refresh_token)).status_code == 401


def test_token_of_an_unknown_user_is_rejected(client: TestClient) -> None:
    assert client.get("/auth/me", headers=bearer(create_access_token(9999))).status_code == 401


def test_token_of_a_deactivated_user_is_rejected(client: TestClient, db_session: Session) -> None:
    user = create_user(db_session, is_active=False)
    assert client.get("/auth/me", headers=bearer(create_access_token(user.id))).status_code == 401


def test_authorization_header_with_another_scheme_is_rejected(client: TestClient) -> None:
    assert client.get("/auth/me", headers={"Authorization": "Basic dXNlcjpwYXNz"}).status_code == 401


def test_valid_token_reaches_the_replenishment_routes(client: TestClient, db_session: Session) -> None:
    user = create_user(db_session)
    response = client.get("/replenishment/suggestions", headers=bearer(create_access_token(user.id)))
    assert response.status_code == 200
    assert response.json() == []


def test_an_operator_token_is_not_enough_for_admin_routes(client: TestClient, db_session: Session) -> None:
    user = create_user(db_session)
    assert client.get("/users", headers=bearer(create_access_token(user.id))).status_code == 403
