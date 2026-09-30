import httpx

from app.core.config import get_settings


OFF_PATH = "/api/v2/product/{barcode}.json"
OFF_FIELDS = "product_name,generic_name,image_url"
TIMEOUT_SECONDS = 5.0
HEADERS = {"User-Agent": "Inventaire/1.0 (projet etudiant)"}


class OpenFoodFactsError(Exception):
    pass


class OpenFoodFactsTimeoutError(OpenFoodFactsError):
    pass


class OpenFoodFactsUnavailableError(OpenFoodFactsError):
    pass


class OpenFoodFactsProductNotFoundError(OpenFoodFactsError):
    pass


def fetch_product(barcode: str) -> dict:
    url = get_settings().openfoodfacts_base_url + OFF_PATH.format(barcode=barcode)

    try:
        response = httpx.get(url, params={"fields": OFF_FIELDS}, headers=HEADERS, timeout=TIMEOUT_SECONDS)
    # TimeoutException is a subclass of RequestError, so it must be caught first.
    except httpx.TimeoutException as exc:
        raise OpenFoodFactsTimeoutError(barcode) from exc
    except httpx.RequestError as exc:
        raise OpenFoodFactsUnavailableError(barcode) from exc

    if response.status_code == 404:
        raise OpenFoodFactsProductNotFoundError(barcode)
    if response.status_code != 200:
        raise OpenFoodFactsUnavailableError(barcode)

    try:
        data = response.json()
    except ValueError as exc:
        raise OpenFoodFactsUnavailableError(barcode) from exc

    # Open Food Facts may answer 200 with status 0, e.g. for a malformed barcode.
    if data.get("status") != 1:
        raise OpenFoodFactsProductNotFoundError(barcode)

    # "or None" below turns the empty strings Open Food Facts sends into None.
    product = data.get("product", {})
    return {
        "barcode": barcode,
        "name": product.get("product_name") or None,
        "description": product.get("generic_name") or None,
        "image_url": product.get("image_url") or None,
    }
