import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.stock import Stock
from tests.test_purchase_orders import create_location, create_supplier


pytestmark = pytest.mark.usefixtures("authenticated")


def create_product(
    client: TestClient, sku: str, threshold: int, supplier_id: int | None, price: str = "5.00"
) -> int:
    category = client.post("/categories", json={"name": f"Categorie {sku}", "description": None})
    assert category.status_code == 201
    response = client.post(
        "/products",
        json={
            "sku": sku,
            "name": f"Produit {sku}",
            "unit_price": price,
            "reorder_threshold": threshold,
            "category_id": category.json()["id"],
            "supplier_id": supplier_id,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def set_stock(db_session: Session, product_id: int, location_id: int, quantity: int) -> None:
    db_session.add(Stock(product_id=product_id, location_id=location_id, quantity=quantity))
    db_session.commit()


def suggestions(client: TestClient, **params) -> dict[int, dict]:
    response = client.get("/replenishment/suggestions", params=params)
    assert response.status_code == 200, response.text
    return {item["product_id"]: item for item in response.json()}


def test_replenishment_requires_authentication(client: TestClient) -> None:
    client.headers.pop("Authorization")
    assert client.get("/replenishment/suggestions").status_code == 401
    assert client.post("/replenishment/orders", json={}).status_code == 401


def test_suggestions_sum_the_stock_of_every_location(client: TestClient, db_session: Session) -> None:
    supplier = create_supplier(client)
    product = create_product(client, "LOW-001", threshold=10, supplier_id=supplier)
    set_stock(db_session, product, create_location(client, "ZONE-A"), 3)
    set_stock(db_session, product, create_location(client, "ZONE-B"), 2)

    item = suggestions(client)[product]
    assert item["current_quantity"] == 5
    assert item["reorder_threshold"] == 10
    # Back to twice the threshold: 2 x 10 - 5
    assert item["suggested_quantity"] == 15


def test_suggestions_ignore_products_that_are_not_under_their_threshold(
    client: TestClient, db_session: Session
) -> None:
    supplier = create_supplier(client)
    location = create_location(client)
    enough = create_product(client, "OK-001", threshold=10, supplier_id=supplier)
    set_stock(db_session, enough, location, 10)
    no_threshold = create_product(client, "ZERO-001", threshold=0, supplier_id=supplier)

    listed = suggestions(client)
    assert enough not in listed
    assert no_threshold not in listed


def test_a_product_without_any_stock_counts_as_zero(client: TestClient) -> None:
    supplier = create_supplier(client)
    product = create_product(client, "EMPTY-001", threshold=4, supplier_id=supplier)

    item = suggestions(client)[product]
    assert item["current_quantity"] == 0
    assert item["suggested_quantity"] == 8


def test_suggestions_can_be_filtered_by_supplier(client: TestClient) -> None:
    first = create_supplier(client, "Metro")
    second = create_supplier(client, "Promocash")
    mine = create_product(client, "A-001", threshold=4, supplier_id=first)
    other = create_product(client, "B-001", threshold=4, supplier_id=second)
    orphan = create_product(client, "C-001", threshold=4, supplier_id=None)

    assert set(suggestions(client, supplier_id=first)) == {mine}
    # Without the filter, a product with no supplier is listed, but with a null supplier.
    everything = suggestions(client)
    assert set(everything) == {mine, other, orphan}
    assert everything[orphan]["supplier_id"] is None


def test_create_order_uses_the_server_side_quantities(client: TestClient, db_session: Session) -> None:
    supplier = create_supplier(client)
    location = create_location(client)
    product = create_product(client, "LOW-001", threshold=10, supplier_id=supplier, price="6.00")
    set_stock(db_session, product, location, 4)

    response = client.post(
        "/replenishment/orders",
        json={"supplier_id": supplier, "location_id": location, "product_ids": [product]},
    )
    assert response.status_code == 201, response.text
    order = response.json()
    assert order["status"] == "draft"
    assert order["supplier_id"] == supplier
    assert [(line["product_id"], line["quantity"], line["unit_price"]) for line in order["lines"]] == [
        (product, 16, "6.00")
    ]
    assert order["total_price"] == "96.00"


def test_create_order_rejects_unknown_supplier_and_location(client: TestClient) -> None:
    supplier = create_supplier(client)
    location = create_location(client)
    product = create_product(client, "LOW-001", threshold=4, supplier_id=supplier)

    unknown_supplier = {"supplier_id": 9999, "location_id": location, "product_ids": [product]}
    unknown_location = {"supplier_id": supplier, "location_id": 9999, "product_ids": [product]}
    assert client.post("/replenishment/orders", json=unknown_supplier).status_code == 404
    assert client.post("/replenishment/orders", json=unknown_location).status_code == 404


def test_create_order_rejects_a_product_that_is_not_under_its_threshold(
    client: TestClient, db_session: Session
) -> None:
    supplier = create_supplier(client)
    location = create_location(client)
    enough = create_product(client, "OK-001", threshold=4, supplier_id=supplier)
    set_stock(db_session, enough, location, 50)

    payload = {"supplier_id": supplier, "location_id": location, "product_ids": [enough]}
    assert client.post("/replenishment/orders", json=payload).status_code == 409
    # Nothing was created.
    assert client.get("/purchase-orders").json() == []


def test_create_order_rejects_a_product_of_another_supplier(client: TestClient) -> None:
    first = create_supplier(client, "Metro")
    second = create_supplier(client, "Promocash")
    location = create_location(client)
    foreign = create_product(client, "B-001", threshold=4, supplier_id=second)
    orphan = create_product(client, "C-001", threshold=4, supplier_id=None)

    for product in (foreign, orphan):
        payload = {"supplier_id": first, "location_id": location, "product_ids": [product]}
        assert client.post("/replenishment/orders", json=payload).status_code == 409
    assert client.get("/purchase-orders").json() == []


def test_create_order_accepts_a_repeated_product_id_once(client: TestClient) -> None:
    supplier = create_supplier(client)
    location = create_location(client)
    product = create_product(client, "LOW-001", threshold=4, supplier_id=supplier)

    payload = {"supplier_id": supplier, "location_id": location, "product_ids": [product, product]}
    response = client.post("/replenishment/orders", json=payload)
    assert response.status_code == 201
    assert len(response.json()["lines"]) == 1
