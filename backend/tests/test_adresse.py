import httpx
import pytest

from app.clients import adresse


def fake_response(status_code: int, text: str) -> httpx.Response:
    return httpx.Response(status_code, text=text, request=httpx.Request("GET", "https://test"))


def mock_get(monkeypatch: pytest.MonkeyPatch, response: httpx.Response | None = None, error: Exception | None = None) -> None:
    def fake_get(*args, **kwargs) -> httpx.Response:
        if error is not None:
            raise error
        assert response is not None
        return response

    monkeypatch.setattr(adresse.httpx, "get", fake_get)


def test_search_address_found(monkeypatch: pytest.MonkeyPatch) -> None:
    body = (
        '{"features": [{"geometry": {"coordinates": [2.298047, 49.897452]}, '
        '"properties": {"label": "8 Boulevard du Port 80000 Amiens", "city": "Amiens", "postcode": "80000"}}]}'
    )
    mock_get(monkeypatch, fake_response(200, body))

    result = adresse.search_address("8 boulevard du port amiens")
    assert result == {
        "label": "8 Boulevard du Port 80000 Amiens",
        "city": "Amiens",
        "postcode": "80000",
        "longitude": 2.298047,
        "latitude": 49.897452,
    }


def test_search_address_not_found_with_empty_features(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(200, '{"features": []}'))
    with pytest.raises(adresse.AdresseNotFoundError):
        adresse.search_address("adresse qui n'existe pas")


def test_search_address_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, error=httpx.ReadTimeout("trop lent"))
    with pytest.raises(adresse.AdresseTimeoutError):
        adresse.search_address("8 boulevard du port amiens")


def test_search_address_network_error(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, error=httpx.ConnectError("pas de reseau"))
    with pytest.raises(adresse.AdresseUnavailableError):
        adresse.search_address("8 boulevard du port amiens")


def test_search_address_server_error(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(500, "erreur"))
    with pytest.raises(adresse.AdresseUnavailableError):
        adresse.search_address("8 boulevard du port amiens")


def test_search_address_invalid_json(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_get(monkeypatch, fake_response(200, "<html>maintenance</html>"))
    with pytest.raises(adresse.AdresseUnavailableError):
        adresse.search_address("8 boulevard du port amiens")
