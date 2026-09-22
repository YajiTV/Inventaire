import { apiFetch } from "../lib/api";
import { PRODUCTS_PAGE_SIZE } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead, ProductCreate, PageProductRead, ProductUpdate } from "../types/api";

export async function getProducts(filters: ProductFilters, offset: number): Promise<PageProductRead> {
    const params = new URLSearchParams();
    params.set("limit", String(PRODUCTS_PAGE_SIZE));
    params.set("offset", String(offset));
    if (filters.search.trim()) params.set("q", filters.search.trim());
    if (filters.categoryId) params.set("category_id", filters.categoryId);
    if (filters.supplierId) params.set("supplier_id", filters.supplierId);
    if (filters.belowThreshold) params.set("below_threshold", "true");

    const res = await apiFetch(`/products?${params.toString()}`);
    return res.json();
}

// ponytail: capped at the API max page size (100), paginate if the catalogue grows past it
export async function getAllProducts(): Promise<ProductRead[]> {
    const res = await apiFetch("/products?limit=100");
    const page: PageProductRead = await res.json();
    return page.items;
}

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
