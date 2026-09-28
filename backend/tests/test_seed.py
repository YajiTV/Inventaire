from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from scripts.seed import ADMIN_EMAIL, ADMIN_PASSWORD, seed

# Tests du script de seed, sur la base SQLite de test (vide au départ)


def test_seed_inserts_the_demo_data(client: TestClient, db_session: Session) -> None:
    assert seed(db_session) is True

    assert len(client.get("/categories").json()) == 4
    assert len(client.get("/suppliers").json()) == 4
    assert client.get("/products").json()["total"] == 6


def test_seed_puts_two_products_below_their_threshold(client: TestClient, db_session: Session) -> None:
    seed(db_session)

    below = client.get("/products?below_threshold=true").json()["items"]
    assert {p["sku"]: p["total_quantity"] for p in below} == {"STEA-HAC-045": 120, "SIRO-COL-010": 5}


def test_seed_creates_a_working_admin_account(client: TestClient, db_session: Session) -> None:
    seed(db_session)

    response = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert response.status_code == 200


def test_seed_does_nothing_the_second_time(client: TestClient, db_session: Session) -> None:
    seed(db_session)
    assert seed(db_session) is False
    assert client.get("/products").json()["total"] == 6
