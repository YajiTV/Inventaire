from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.enums import UserRole
from app.services.password import hash_password


def _create_user(db_session: Session, email: str, role: UserRole, password: str = "s3cret-pass") -> User:
    user = User(
        email=email,
        full_name="Test User",
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _login(client: TestClient, email: str, password: str = "s3cret-pass") -> str:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_list_users_requires_authentication(client: TestClient) -> None:
    response = client.get("/users")
    assert response.status_code == 401


def test_list_users_forbidden_for_non_admin(client: TestClient, db_session: Session) -> None:
    _create_user(db_session, "operateur@inventaire.fr", UserRole.OPERATOR)
    token = _login(client, "operateur@inventaire.fr")

    response = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_list_users_allowed_for_admin(client: TestClient, db_session: Session) -> None:
    _create_user(db_session, "admin@inventaire.fr", UserRole.ADMIN)
    token = _login(client, "admin@inventaire.fr")

    response = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_update_user_allows_self_edit_of_full_name(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, "operateur@inventaire.fr", UserRole.OPERATOR)
    token = _login(client, "operateur@inventaire.fr")

    response = client.patch(
        f"/users/{user.id}",
        json={"full_name": "Nouveau Nom"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Nouveau Nom"


def test_update_user_forbids_self_role_change(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, "operateur@inventaire.fr", UserRole.OPERATOR)
    token = _login(client, "operateur@inventaire.fr")

    response = client.patch(
        f"/users/{user.id}",
        json={"role": "admin"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_update_user_forbidden_for_other_users(client: TestClient, db_session: Session) -> None:
    user_a = _create_user(db_session, "a@inventaire.fr", UserRole.OPERATOR)
    _create_user(db_session, "b@inventaire.fr", UserRole.OPERATOR)
    token_b = _login(client, "b@inventaire.fr")

    response = client.patch(
        f"/users/{user_a.id}",
        json={"full_name": "Hack"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 403


def test_delete_user_requires_admin(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, "operateur@inventaire.fr", UserRole.OPERATOR)
    token = _login(client, "operateur@inventaire.fr")

    response = client.delete(f"/users/{user.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_delete_user_allowed_for_admin(client: TestClient, db_session: Session) -> None:
    _create_user(db_session, "admin@inventaire.fr", UserRole.ADMIN)
    target = _create_user(db_session, "target@inventaire.fr", UserRole.OPERATOR)
    token = _login(client, "admin@inventaire.fr")

    response = client.delete(f"/users/{target.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 204
