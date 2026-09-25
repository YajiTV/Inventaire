import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.repositories import stock_repository


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


def create_location(client: TestClient, code: str = "ZONE-A") -> int:
    response = client.post("/locations", json={"code": code, "name": f"Zone {code}"})
    assert response.status_code == 201
    return response.json()["id"]


def move(client: TestClient, auth: dict[str, str], **payload) -> dict:
    return client.post("/stock-movements", json=payload, headers=auth)


def stock_of(db_session: Session, product_id: int, location_id: int) -> int:
    """Quantity actually stored in "stocks", read straight from the database."""
    stock = stock_repository.get_by_product_and_location(db_session, product_id, location_id)
    return 0 if stock is None else stock.quantity


def test_movements_require_authentication(client: TestClient) -> None:
    assert client.get("/stock-movements").status_code == 401
    assert client.post("/stock-movements", json={"product_id": 1, "type": "in", "quantity": 1}).status_code == 401


def test_incoming_movement_creates_the_stock_line(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    location_id = create_location(client)

    response = move(client, auth, product_id=product_id, type="in", quantity=10, target_location_id=location_id)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["type"] == "in"
    assert body["source_location_id"] is None
    assert body["user_id"] > 0

    assert stock_of(db_session, product_id, location_id) == 10


def test_incoming_movements_add_up(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    location_id = create_location(client)

    move(client, auth, product_id=product_id, type="in", quantity=10, target_location_id=location_id)
    move(client, auth, product_id=product_id, type="in", quantity=5, target_location_id=location_id)

    assert stock_of(db_session, product_id, location_id) == 15


def test_outgoing_movement_removes_the_quantity(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    location_id = create_location(client)
    move(client, auth, product_id=product_id, type="in", quantity=10, target_location_id=location_id)

    response = move(client, auth, product_id=product_id, type="out", quantity=4, source_location_id=location_id)
    assert response.status_code == 201
    assert stock_of(db_session, product_id, location_id) == 6


def test_outgoing_movement_refuses_to_go_negative(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    location_id = create_location(client)
    move(client, auth, product_id=product_id, type="in", quantity=3, target_location_id=location_id)

    response = move(client, auth, product_id=product_id, type="out", quantity=4, source_location_id=location_id)
    assert response.status_code == 409
    # The refused movement changed nothing.
    assert stock_of(db_session, product_id, location_id) == 3


def test_outgoing_movement_refuses_an_empty_location(client: TestClient, auth: dict[str, str]) -> None:
    product_id = create_product(client)
    location_id = create_location(client)

    response = move(client, auth, product_id=product_id, type="out", quantity=1, source_location_id=location_id)
    assert response.status_code == 409


def test_transfer_moves_the_quantity_between_locations(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    source_id = create_location(client, code="ZONE-A")
    target_id = create_location(client, code="ZONE-B")
    move(client, auth, product_id=product_id, type="in", quantity=10, target_location_id=source_id)

    response = move(
        client,
        auth,
        product_id=product_id,
        type="transfer",
        quantity=4,
        source_location_id=source_id,
        target_location_id=target_id,
    )
    assert response.status_code == 201
    assert stock_of(db_session, product_id, source_id) == 6
    assert stock_of(db_session, product_id, target_id) == 4


def test_transfer_refuses_an_insufficient_source(client: TestClient, auth: dict[str, str], db_session: Session) -> None:
    product_id = create_product(client)
    source_id = create_location(client, code="ZONE-A")
    target_id = create_location(client, code="ZONE-B")
    move(client, auth, product_id=product_id, type="in", quantity=2, target_location_id=source_id)

    response = move(
        client,
        auth,
        product_id=product_id,
        type="transfer",
        quantity=5,
        source_location_id=source_id,
        target_location_id=target_id,
    )
    assert response.status_code == 409
    # Nothing arrived at the target either: the whole movement was rolled back.
    assert stock_of(db_session, product_id, target_id) == 0


def test_movement_rejects_an_unknown_product(client: TestClient, auth: dict[str, str]) -> None:
    location_id = create_location(client)
    response = move(client, auth, product_id=999, type="in", quantity=1, target_location_id=location_id)
    assert response.status_code == 404


def test_movement_rejects_an_unknown_location(client: TestClient, auth: dict[str, str]) -> None:
    product_id = create_product(client)
    response = move(client, auth, product_id=product_id, type="in", quantity=1, target_location_id=999)
    assert response.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {"type": "in", "quantity": 5},
        {"type": "out", "quantity": 5},
        {"type": "transfer", "quantity": 5, "source_location_id": 1},
        {"type": "in", "quantity": 0, "target_location_id": 1},
    ],
)
def test_movement_rejects_an_inconsistent_payload(
    client: TestClient, auth: dict[str, str], payload: dict
) -> None:
    response = move(client, auth, product_id=1, **payload)
    assert response.status_code == 422


def test_history_filters_and_orders_by_most_recent(client: TestClient, auth: dict[str, str]) -> None:
    product_id = create_product(client)
    other_id = create_product(client, sku="THE-001")
    location_id = create_location(client)
    move(client, auth, product_id=product_id, type="in", quantity=10, target_location_id=location_id)
    move(client, auth, product_id=other_id, type="in", quantity=7, target_location_id=location_id)
    move(client, auth, product_id=product_id, type="out", quantity=2, source_location_id=location_id)

    history = client.get("/stock-movements", params={"product_id": product_id}, headers=auth).json()
    assert [m["type"] for m in history] == ["out", "in"]

    by_type = client.get("/stock-movements", params={"type": "in"}, headers=auth).json()
    assert len(by_type) == 2

    by_location = client.get(
        "/stock-movements", params={"location_id": location_id, "limit": 2}, headers=auth
    ).json()
    assert len(by_location) == 2
