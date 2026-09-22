import { apiFetch } from "../lib/api";
import { PRODUCTS_PAGE_SIZE } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead, ProductCreate, PageProductRead, ProductUpdate } from "../types/api";

// GET /products : renvoie une page ({ items, total, limit, offset }).
// Les filtres et la pagination partent en paramètres d'URL : c'est le serveur qui filtre.
export async function getProducts(filters: ProductFilters, offset: number): Promise<PageProductRead> {
    // URLSearchParams construit la query string et encode les caractères spéciaux
    const params = new URLSearchParams();
    params.set("limit", String(PRODUCTS_PAGE_SIZE));
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
export async function getProduct(id: number): Promise<ProductRead> {
    const res = await apiFetch(`/products/${id}`);
    return res.json();
}

export async function createProduct(data: ProductCreate): Promise<ProductRead> {
    const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<ProductRead> {
    const res = await apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
}
