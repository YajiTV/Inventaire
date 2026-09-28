import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.clients import openfoodfacts
from app.models.location import Location
from app.models.stock import Stock

# Tests API du CRUD Produits, des relations, des filtres/pagination et de l'enrichissement Open Food Facts.
# Chaque test part d'une base vide (fixture "client" de conftest.py).


# Réponse d'Open Food Facts utilisée par les tests qui simulent un produit trouvé
NUTELLA = {
    "barcode": "3017620422003",
    "name": "Nutella",
    "description": "Pate a tartiner",
    "image_url": "https://images.openfoodfacts.org/nutella.jpg",
}


# Par défaut (autouse = pour TOUS les tests de ce fichier), Open Food Facts est "injoignable" :
# aucun test n'appelle la vraie API, les tests restent rapides et marchent sans internet.
@pytest.fixture(autouse=True)
def off_unavailable(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_fetch(barcode: str) -> dict:
        raise openfoodfacts.OpenFoodFactsUnavailableError(barcode)

    monkeypatch.setattr(openfoodfacts, "fetch_product", fake_fetch)


# Crée une catégorie et renvoie son id
def create_category(client: TestClient, name: str = "Epicerie") -> int:
    response = client.post("/categories", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


# Crée un fournisseur et renvoie son id
def create_supplier(client: TestClient, name: str = "Ferrero") -> int:
    response = client.post("/suppliers", json={"name": name})
    assert response.status_code == 201
    return response.json()["id"]


# Crée un produit via l'API ; "extra" permet de changer ou d'ajouter des champs
def create(client: TestClient, category_id: int, sku: str = "PATE-001", **extra) -> dict:
    payload = {"sku": sku, "name": "Pate a tartiner", "unit_price": "4.50", "category_id": category_id}
    payload.update(extra)
    response = client.post("/products", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


# Ajoute du stock directement en base (la route POST /stocks n'est pas encore codée)
def add_stock(db_session: Session, product_id: int, quantity: int, code: str = "A1") -> None:
    location = Location(code=code, name=f"Zone {code}")
    db_session.add(location)
    db_session.commit()
    db_session.add(Stock(product_id=product_id, location_id=location.id, quantity=quantity))
    db_session.commit()


# ---------- CRUD ----------


def test_create_product(client: TestClient) -> None:
    category_id = create_category(client)
    body = create(client, category_id)
    assert body["sku"] == "PATE-001"
    assert body["unit_price"] == "4.50"
    assert body["total_quantity"] == 0
    assert isinstance(body["id"], int)


def test_create_product_rejects_duplicate_sku(client: TestClient) -> None:
    category_id = create_category(client)
    create(client, category_id)
    response = client.post(
        "/products", json={"sku": "PATE-001", "name": "Autre", "unit_price": "1.00", "category_id": category_id}
    )
    assert response.status_code == 409


def test_create_product_rejects_negative_price(client: TestClient) -> None:
    category_id = create_category(client)
    response = client.post(
        "/products", json={"sku": "PATE-001", "name": "Pate", "unit_price": "-1", "category_id": category_id}
    )
    assert response.status_code == 422


def test_get_product(client: TestClient) -> None:
    created = create(client, create_category(client))
    response = client.get(f"/products/{created['id']}")
    assert response.status_code == 200
    assert response.json()["sku"] == "PATE-001"


def test_get_product_not_found(client: TestClient) -> None:
    response = client.get("/products/999")
    assert response.status_code == 404


def test_update_product_changes_only_sent_fields(client: TestClient) -> None:
    created = create(client, create_category(client))
    response = client.patch(f"/products/{created['id']}", json={"name": "Pate bio"})
    assert response.status_code == 200
    assert response.json()["name"] == "Pate bio"
    assert response.json()["unit_price"] == "4.50"


def test_update_product_not_found(client: TestClient) -> None:
    response = client.patch("/products/999", json={"name": "Peu importe"})
    assert response.status_code == 404


def test_delete_product(client: TestClient) -> None:
    created = create(client, create_category(client))
    response = client.delete(f"/products/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/products/{created['id']}").status_code == 404


def test_delete_product_not_found(client: TestClient) -> None:
    response = client.delete("/products/999")
    assert response.status_code == 404


# ---------- Relations ----------


def test_create_product_with_unknown_category(client: TestClient) -> None:
    response = client.post("/products", json={"sku": "PATE-001", "name": "Pate", "unit_price": "1.00", "category_id": 999})
    assert response.status_code == 404
    assert response.json()["detail"] == "Categorie introuvable"


def test_create_product_with_unknown_supplier(client: TestClient) -> None:
    category_id = create_category(client)
    response = client.post(
        "/products",
        json={"sku": "PATE-001", "name": "Pate", "unit_price": "1.00", "category_id": category_id, "supplier_id": 999},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Fournisseur introuvable"


def test_update_product_with_unknown_category(client: TestClient) -> None:
    created = create(client, create_category(client))
    response = client.patch(f"/products/{created['id']}", json={"category_id": 999})
    assert response.status_code == 404


def test_update_product_with_unknown_supplier(client: TestClient) -> None:
    created = create(client, create_category(client))
    response = client.patch(f"/products/{created['id']}", json={"supplier_id": 999})
    assert response.status_code == 404


# ---------- Filtres et pagination ----------


def test_list_products_search_in_name_sku_and_barcode(client: TestClient) -> None:
    category_id = create_category(client)
    create(client, category_id, sku="CAFE-001", name="Cafe moulu")
    create(client, category_id, sku="THE-001", name="The vert", barcode="12345678")

    # Recherche sans tenir compte des majuscules, dans le nom
    assert client.get("/products?q=CAFE").json()["total"] == 1
    # dans le SKU
    assert client.get("/products?q=the-0").json()["total"] == 1
    # dans le code-barres
    assert client.get("/products?q=2345").json()["items"][0]["sku"] == "THE-001"


def test_list_products_filter_by_category_and_supplier(client: TestClient) -> None:
    epicerie = create_category(client, "Epicerie")
    boissons = create_category(client, "Boissons")
    ferrero = create_supplier(client)
    create(client, epicerie, sku="P-1", supplier_id=ferrero)
    create(client, epicerie, sku="P-2")
    create(client, boissons, sku="P-3", supplier_id=ferrero)

    assert client.get(f"/products?category_id={epicerie}").json()["total"] == 2
    assert client.get(f"/products?supplier_id={ferrero}").json()["total"] == 2
    # Deux filtres ensemble = ET
    both = client.get(f"/products?category_id={epicerie}&supplier_id={ferrero}").json()
    assert [p["sku"] for p in both["items"]] == ["P-1"]


def test_list_products_below_threshold_uses_total_quantity(client: TestClient, db_session: Session) -> None:
    category_id = create_category(client)
    full = create(client, category_id, sku="P-FULL", reorder_threshold=10)
    low = create(client, category_id, sku="P-LOW", reorder_threshold=10)
    add_stock(db_session, full["id"], 30, code="A1")
    add_stock(db_session, low["id"], 4, code="A2")

    body = client.get("/products?below_threshold=true").json()
    assert [p["sku"] for p in body["items"]] == ["P-LOW"]
    assert body["items"][0]["total_quantity"] == 4


def test_total_quantity_sums_all_locations(client: TestClient, db_session: Session) -> None:
    created = create(client, create_category(client))
    add_stock(db_session, created["id"], 5, code="A1")
    add_stock(db_session, created["id"], 7, code="A2")

    assert client.get(f"/products/{created['id']}").json()["total_quantity"] == 12


def test_list_products_pagination(client: TestClient) -> None:
    category_id = create_category(client)
    for i in range(5):
        create(client, category_id, sku=f"P-{i}")

    page2 = client.get("/products?limit=2&offset=2").json()
    assert page2["total"] == 5
    assert page2["limit"] == 2
    assert page2["offset"] == 2
    assert [p["sku"] for p in page2["items"]] == ["P-2", "P-3"]


@pytest.mark.parametrize("query", ["limit=0", "limit=101", "offset=-1"])
def test_list_products_rejects_invalid_pagination(client: TestClient, query: str) -> None:
    assert client.get(f"/products?{query}").status_code == 422


# ---------- Open Food Facts (toujours simulé) ----------


def test_lookup_returns_open_food_facts_data(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(openfoodfacts, "fetch_product", lambda barcode: NUTELLA)
    response = client.get("/products/lookup/3017620422003")
    assert response.status_code == 200
    assert response.json()["name"] == "Nutella"


@pytest.mark.parametrize(
    ("error", "expected_status"),
    [
        (openfoodfacts.OpenFoodFactsProductNotFoundError, 404),
        (openfoodfacts.OpenFoodFactsUnavailableError, 502),
        (openfoodfacts.OpenFoodFactsTimeoutError, 504),
    ],
)
def test_lookup_maps_errors_to_http_codes(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, error: type[Exception], expected_status: int
) -> None:
    def fake_fetch(barcode: str) -> dict:
        raise error(barcode)

    monkeypatch.setattr(openfoodfacts, "fetch_product", fake_fetch)
    assert client.get("/products/lookup/3017620422003").status_code == expected_status


def test_create_product_is_enriched_by_open_food_facts(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(openfoodfacts, "fetch_product", lambda barcode: NUTELLA)
    created = create(client, create_category(client), barcode="3017620422003")

    # Les infos sont enregistrées en base : on les relit avec un GET
    body = client.get(f"/products/{created['id']}").json()
    assert body["description"] == "Pate a tartiner"
    assert body["image_url"] == "https://images.openfoodfacts.org/nutella.jpg"


def test_create_product_keeps_its_own_description(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(openfoodfacts, "fetch_product", lambda barcode: NUTELLA)
    created = create(client, create_category(client), barcode="3017620422003", description="Ma description")
    assert created["description"] == "Ma description"
    assert created["image_url"] == "https://images.openfoodfacts.org/nutella.jpg"


def test_create_product_works_when_open_food_facts_is_down(client: TestClient) -> None:
    # La fixture autouse simule déjà une panne d'Open Food Facts
    created = create(client, create_category(client), barcode="3017620422003")
    assert created["description"] is None
    assert created["image_url"] is None
