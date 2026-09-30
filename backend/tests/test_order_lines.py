import pytest
from fastapi.testclient import TestClient

from tests.test_purchase_orders import create_order, create_product


pytestmark = pytest.mark.usefixtures("authenticated")


def lines_url(order_id: int) -> str:
    return f"/purchase-orders/{order_id}/lines"


def add_line(client: TestClient, order_id: int, product_id: int, quantity: int = 2) -> dict:
    response = client.post(
        lines_url(order_id),
        json={"product_id": product_id, "quantity": quantity, "unit_price": "4.00"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_order_lines_require_authentication(client: TestClient) -> None:
    order = create_order(client)
    line_id = order["lines"][0]["id"]
    client.headers.pop("Authorization")
    assert client.get(lines_url(order["id"])).status_code == 401
    assert client.get(f"{lines_url(order['id'])}/{line_id}").status_code == 401
    assert client.post(lines_url(order["id"]), json={}).status_code == 401
    assert client.patch(f"{lines_url(order['id'])}/{line_id}", json={}).status_code == 401
    assert client.delete(f"{lines_url(order['id'])}/{line_id}").status_code == 401


def test_list_order_lines(client: TestClient) -> None:
    order = create_order(client)
    response = client.get(lines_url(order["id"]))
    assert response.status_code == 200
    assert [line["id"] for line in response.json()] == [line["id"] for line in order["lines"]]


def test_list_lines_of_unknown_order_returns_404(client: TestClient) -> None:
    assert client.get(lines_url(9999)).status_code == 404


def test_get_one_line(client: TestClient) -> None:
    order = create_order(client)
    line = order["lines"][0]
    response = client.get(f"{lines_url(order['id'])}/{line['id']}")
    assert response.status_code == 200
    assert response.json() == line


def test_get_unknown_line_or_order_returns_404(client: TestClient) -> None:
    order = create_order(client)
    assert client.get(f"{lines_url(order['id'])}/9999").status_code == 404
    assert client.get(f"{lines_url(9999)}/{order['lines'][0]['id']}").status_code == 404


def test_create_line_updates_the_order_total(client: TestClient) -> None:
    order = create_order(client)
    line = add_line(client, order["id"], create_product(client, sku="SKU-EXTRA"), quantity=2)
    assert line["order_id"] == order["id"]
    # 3 x 12.50 (existing line) + 2 x 4.00 (new line)
    assert client.get(f"/purchase-orders/{order['id']}").json()["total_price"] == "45.50"


def test_create_line_rejects_unknown_order_and_product(client: TestClient) -> None:
    order = create_order(client)
    payload = {"product_id": create_product(client, sku="SKU-EXTRA"), "quantity": 1, "unit_price": "1.00"}
    assert client.post(lines_url(9999), json=payload).status_code == 404
    unknown_product = {**payload, "product_id": 9999}
    assert client.post(lines_url(order["id"]), json=unknown_product).status_code == 404


def test_create_line_rejects_a_product_already_in_the_order(client: TestClient) -> None:
    order = create_order(client)
    duplicate = {"product_id": order["lines"][0]["product_id"], "quantity": 1, "unit_price": "1.00"}
    assert client.post(lines_url(order["id"]), json=duplicate).status_code == 409


def test_create_line_rejects_an_invalid_quantity(client: TestClient) -> None:
    order = create_order(client)
    payload = {"product_id": create_product(client, sku="SKU-EXTRA"), "quantity": 0, "unit_price": "1.00"}
    assert client.post(lines_url(order["id"]), json=payload).status_code == 422


def test_update_line_changes_quantity_and_price(client: TestClient) -> None:
    order = create_order(client)
    line_id = order["lines"][0]["id"]
    response = client.patch(f"{lines_url(order['id'])}/{line_id}", json={"quantity": 10, "unit_price": "2.00"})
    assert response.status_code == 200
    assert response.json()["quantity"] == 10
    assert client.get(f"/purchase-orders/{order['id']}").json()["total_price"] == "20.00"


def test_update_unknown_line_returns_404(client: TestClient) -> None:
    order = create_order(client)
    assert client.patch(f"{lines_url(order['id'])}/9999", json={"quantity": 1}).status_code == 404


def test_a_line_cannot_be_reached_through_another_order(client: TestClient) -> None:
    first = create_order(client, reference="CMD-0001")
    second = create_order(client, reference="CMD-0002")
    foreign_line_id = first["lines"][0]["id"]
    assert client.patch(f"{lines_url(second['id'])}/{foreign_line_id}", json={"quantity": 1}).status_code == 404
    assert client.delete(f"{lines_url(second['id'])}/{foreign_line_id}").status_code == 404


def test_delete_line_keeps_the_others(client: TestClient) -> None:
    order = create_order(client)
    extra = add_line(client, order["id"], create_product(client, sku="SKU-EXTRA"))
    assert client.delete(f"{lines_url(order['id'])}/{extra['id']}").status_code == 204
    remaining = client.get(lines_url(order["id"])).json()
    assert [line["id"] for line in remaining] == [order["lines"][0]["id"]]


def test_delete_refuses_the_last_line(client: TestClient) -> None:
    order = create_order(client)
    line_id = order["lines"][0]["id"]
    assert client.delete(f"{lines_url(order['id'])}/{line_id}").status_code == 409


def test_lines_are_locked_once_the_order_is_sent(client: TestClient) -> None:
    order = create_order(client)
    line_id = order["lines"][0]["id"]
    extra_product = create_product(client, sku="SKU-EXTRA")
    assert client.patch(f"/purchase-orders/{order['id']}", json={"status": "sent"}).status_code == 200

    new_line = {"product_id": extra_product, "quantity": 1, "unit_price": "1.00"}
    assert client.post(lines_url(order["id"]), json=new_line).status_code == 409
    assert client.patch(f"{lines_url(order['id'])}/{line_id}", json={"quantity": 1}).status_code == 409
    assert client.delete(f"{lines_url(order['id'])}/{line_id}").status_code == 409
