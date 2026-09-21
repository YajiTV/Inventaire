import { apiFetch } from "../lib/api";
import { PRODUITS_PAGE_SIZE } from "../types/product";
import type { Produit, ProduitCreate, ProduitFilters, ProduitsPage, ProduitUpdate } from "../types/product";

// GET /products : renvoie une page ({ items, total, limit, offset }).
// Les filtres et la pagination partent en paramètres d'URL : c'est le serveur qui filtre.
export async function getProduits(filters: ProduitFilters, offset: number): Promise<ProduitsPage> {
    // URLSearchParams construit la query string et encode les caractères spéciaux
    const params = new URLSearchParams();
    params.set("limit", String(PRODUITS_PAGE_SIZE));
    params.set("offset", String(offset));
    // On n'envoie un filtre que s'il est renseigné
    if (filters.search.trim()) params.set("q", filters.search.trim());
    if (filters.categoryId) params.set("category_id", filters.categoryId);
    if (filters.supplierId) params.set("supplier_id", filters.supplierId);
    if (filters.belowThreshold) params.set("below_threshold", "true");

    const res = await apiFetch(`/products?${params.toString()}`);
    return res.json();
}

// GET /products/:id : un seul produit (page détail)
export async function getProduit(id: number): Promise<Produit> {
    const res = await apiFetch(`/products/${id}`);
    return res.json();
}

export async function createProduit(data: ProduitCreate): Promise<Produit> {
    const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateProduit(id: number, data: ProduitUpdate): Promise<Produit> {
    const res = await apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteProduit(id: number): Promise<void> {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
}
