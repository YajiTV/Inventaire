import { useState } from "react";
import {
    getProducts,
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../api/products";
import { EMPTY_PRODUCT_FILTERS, PRODUCTS_PAGE_SIZE } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { PageProductRead, ProductRead, ProductCreate, ProductUpdate } from "../types/api";
import { useFetch } from "./useFetch";

const EMPTY_PAGE: PageProductRead = { items: [], total: 0, limit: PRODUCTS_PAGE_SIZE, offset: 0 };

export function useProducts(filters: ProductFilters = EMPTY_PRODUCT_FILTERS, offset = 0) {
    const [reloadKey, setReloadKey] = useState(0);
    const { data: page, setData: setPage, loading, error } = useFetch(
        () => getProducts(filters, offset),
        EMPTY_PAGE,
        JSON.stringify([filters, offset, reloadKey]),
    );

    async function addProduct(data: ProductCreate) {
        await createProduct(data);
        setReloadKey((k) => k + 1);
    }

    async function editProduct(id: number, data: ProductUpdate) {
        const updated = await updateProduct(id, data);
        setPage((prev) => ({ ...prev, items: prev.items.map((p) => (p.id === id ? updated : p)) }));
    }

    async function removeProduct(id: number) {
        await deleteProduct(id);
        setReloadKey((k) => k + 1);
    }

    return { products: page.items, total: page.total, loading, error, addProduct, editProduct, removeProduct };
}

export function useAllProducts() {
    const { data: products, loading, error } = useFetch<ProductRead[]>(getAllProducts, []);
    return { products, loading, error };
}

export function useProduct(id: number) {
    const { data: product, loading, error } = useFetch<ProductRead | null>(() => getProduct(id), null, id);
    return { product, loading, error };
}
