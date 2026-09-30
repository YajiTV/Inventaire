import httpx

from app.core.config import get_settings

# Client = la seule couche qui parle à une API EXTERNE (ici Open Food Facts).
# Comme le repository pour la base, il cache les détails techniques au service :
# le service appelle fetch_product(barcode) et reçoit un dictionnaire, ou une erreur métier.


# Adresse de l'API publique Open Food Facts (version 2) : la base vient du .env (OPENFOODFACTS_BASE_URL)
OFF_PATH = "/api/v2/product/{barcode}.json"
# On ne demande que les champs utiles : la réponse est plus légère et plus rapide
OFF_FIELDS = "product_name,generic_name,image_url"
# Temps maximum d'attente en secondes : au-delà on abandonne, pour ne pas bloquer notre API
TIMEOUT_SECONDS = 5.0
# Open Food Facts demande que chaque application s'identifie avec un User-Agent
HEADERS = {"User-Agent": "Inventaire/1.0 (projet etudiant)"}


# Erreur "parente" : toutes les erreurs Open Food Facts en héritent,
# ce qui permet de les attraper toutes d'un coup avec "except OpenFoodFactsError"
class OpenFoodFactsError(Exception):
    pass


# Erreur : Open Food Facts n'a pas répondu à temps (le router la transformera en 504)
class OpenFoodFactsTimeoutError(OpenFoodFactsError):
    pass


# Erreur : Open Food Facts est injoignable ou a renvoyé une réponse inutilisable (-> 502)
class OpenFoodFactsUnavailableError(OpenFoodFactsError):
    pass


# Erreur : ce code-barres n'existe pas dans Open Food Facts (-> 404)
class OpenFoodFactsProductNotFoundError(OpenFoodFactsError):
    pass


# Va chercher un produit sur Open Food Facts à partir de son code-barres.
# Renvoie un dictionnaire au format ProductLookup (barcode, name, description, image_url).
def fetch_product(barcode: str) -> dict:
    url = get_settings().openfoodfacts_base_url + OFF_PATH.format(barcode=barcode)

    # 1. L'appel HTTP. L'ordre des except compte : TimeoutException est un cas
    #    particulier de RequestError, il doit donc être testé en premier.
    try:
        response = httpx.get(url, params={"fields": OFF_FIELDS}, headers=HEADERS, timeout=TIMEOUT_SECONDS)
    except httpx.TimeoutException as exc:
        raise OpenFoodFactsTimeoutError(barcode) from exc
    except httpx.RequestError as exc:
        # Pas de réseau, DNS introuvable, connexion refusée...
        raise OpenFoodFactsUnavailableError(barcode) from exc

    # 2. Le code HTTP : 404 = produit inconnu, tout autre code que 200 = problème chez eux
    if response.status_code == 404:
        raise OpenFoodFactsProductNotFoundError(barcode)
    if response.status_code != 200:
        raise OpenFoodFactsUnavailableError(barcode)

    # 3. Le contenu : ça doit être du JSON valide
    try:
        data = response.json()
    except ValueError as exc:
        raise OpenFoodFactsUnavailableError(barcode) from exc

    # 4. Open Food Facts met "status": 1 si le produit est trouvé, 0 sinon
    #    (il renvoie parfois 200 avec status 0, par exemple pour un code mal formé)
    if data.get("status") != 1:
        raise OpenFoodFactsProductNotFoundError(barcode)

    # 5. On ne garde que les champs utiles, avec nos propres noms.
    #    "or None" transforme une chaîne vide "" en None (champ absent)
    product = data.get("product", {})
    return {
        "barcode": barcode,
        "name": product.get("product_name") or None,
        "description": product.get("generic_name") or None,
        "image_url": product.get("image_url") or None,
    }
