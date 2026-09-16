import { apiFetch } from "../lib/api";
import type { Produit, ProduitCreate, ProduitUpdate } from "../types/product";

// GET /products renvoie une page ({ items, total, limit, offset }), voir
// src/api/mocks/handlers/products.ts. On ne récupère que la liste des items.
interface ProduitsPage {
    items: Produit[];
    total: number;
    limit: number;
    offset: number;
}

export async function getProduits(): Promise<Produit[]> {
    const res = await apiFetch("/products");
    const page: ProduitsPage = await res.json();
    return page.items;
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
