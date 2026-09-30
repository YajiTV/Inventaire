import httpx
import pytest

from app.clients import openfoodfacts


def fake_response(status_code: int, text: str) -> httpx.Response:
    return httpx.Response(status_code, text=text, request=httpx.Request("GET", "https://test"))


def mock_get(monkeypatch: pytest.MonkeyPatch, response: httpx.Response | None = None, error: Exception | None = None) -> None:
    def fake_get(*args, **kwargs) -> httpx.Response:
        if error is not None:
            raise error
        assert response is not None
        return response

    monkeypatch.setattr(openfoodfacts.httpx, "get", fake_get)


def test_fetch_product_found(monkeypatch: pytest.MonkeyPatch) -> None:
    body = '{"status": 1, "product": {"product_name": "Nutella", "generic_name": "", "image_url": "https://img/n.jpg"}}'
    mock_get(monkeypatch, fake_response(200, body))

    product = openfoodfacts.fetch_product("3017620422003")
    assert product == {
        "barcode": "3017620422003",
        "name": "Nutella",
        "description": None,
        "image_url": "https://img/n.jpg",
    }


def test_fetch_product_not_found_with_http_404(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(404, '{"status": 0}'))
    with pytest.raises(openfoodfacts.OpenFoodFactsProductNotFoundError):
        openfoodfacts.fetch_product("3017620422999")


def test_fetch_product_not_found_with_status_0(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(200, '{"status": 0}'))
    with pytest.raises(openfoodfacts.OpenFoodFactsProductNotFoundError):
        openfoodfacts.fetch_product("0000")


def test_fetch_product_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, error=httpx.ReadTimeout("trop lent"))
    with pytest.raises(openfoodfacts.OpenFoodFactsTimeoutError):
        openfoodfacts.fetch_product("3017620422003")


def test_fetch_product_network_error(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, error=httpx.ConnectError("pas de reseau"))
    with pytest.raises(openfoodfacts.OpenFoodFactsUnavailableError):
        openfoodfacts.fetch_product("3017620422003")


def test_fetch_product_server_error(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(500, "erreur"))
    with pytest.raises(openfoodfacts.OpenFoodFactsUnavailableError):
        openfoodfacts.fetch_product("3017620422003")


def test_fetch_product_invalid_json(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(200, "<html>maintenance</html>"))
    with pytest.raises(openfoodfacts.OpenFoodFactsUnavailableError):
        openfoodfacts.fetch_product("3017620422003")
