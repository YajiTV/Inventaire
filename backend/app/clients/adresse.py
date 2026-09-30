import httpx

# Client = la seule couche qui parle à l'API Adresse (Base Adresse Nationale, gouv.fr).
# Même logique que le client Open Food Facts : le service reçoit un dictionnaire ou une erreur métier.

BAN_URL = "https://api-adresse.data.gouv.fr/search/"
TIMEOUT_SECONDS = 5.0
HEADERS = {"User-Agent": "Inventaire/1.0 (projet etudiant)"}


class AdresseError(Exception):
    pass


class AdresseTimeoutError(AdresseError):
    pass


class AdresseUnavailableError(AdresseError):
    pass


class AdresseNotFoundError(AdresseError):
    pass


def search_address(query: str) -> dict:
    try:
        response = httpx.get(BAN_URL, params={"q": query, "limit": 1}, headers=HEADERS, timeout=TIMEOUT_SECONDS)
    except httpx.TimeoutException as exc:
        raise AdresseTimeoutError(query) from exc
    except httpx.RequestError as exc:
        raise AdresseUnavailableError(query) from exc

    if response.status_code != 200:
        raise AdresseUnavailableError(query)

    try:
        data = response.json()
    except ValueError as exc:
        raise AdresseUnavailableError(query) from exc

    features = data.get("features", [])
    if not features:
        raise AdresseNotFoundError(query)

    properties = features[0].get("properties", {})
    coordinates = features[0].get("geometry", {}).get("coordinates", [None, None])

    return {
        "label": properties.get("label"),
        "city": properties.get("city"),
        "postcode": properties.get("postcode"),
        "longitude": coordinates[0],
        "latitude": coordinates[1],
    }
