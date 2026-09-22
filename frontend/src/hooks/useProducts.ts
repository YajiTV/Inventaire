import { useEffect, useState } from "react";
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../api/products";
import { EMPTY_PRODUCT_FILTERS } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead, ProductCreate, ProductUpdate } from "../types/api";

export function useProducts(filters: ProductFilters = EMPTY_PRODUCT_FILTERS, offset = 0) {
    const [products, setProducts] = useState<ProductRead[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Loading is derived: true until the latest requested key has finished loading
    const requestKey = JSON.stringify([filters, offset, reloadKey]);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const loading = loadedKey !== requestKey;

    useEffect(() => {
        // Ignore responses that arrive after the filters changed or the component unmounted
        let cancelled = false;

        getProducts(filters, offset)
            .then((page) => {
                if (cancelled) return;
                setProducts(page.items);
                setTotal(page.total);
                setError(null);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue");
            })
            .finally(() => {
                if (!cancelled) setLoadedKey(requestKey);
            });

        return () => {
            cancelled = true;
        };
    }, [filters, offset, reloadKey, requestKey]);

    async function addProduct(data: ProductCreate) {
        await createProduct(data);
        setReloadKey((k) => k + 1);
    }

    async function editProduct(id: number, data: ProductUpdate) {
        const maj = await updateProduct(id, data);
        setProducts((prev) => prev.map((p) => (p.id === id ? maj : p)));
    }

    async function removeProduct(id: number) {
        await deleteProduct(id);
        setReloadKey((k) => k + 1);
    }

    return { products, total, loading, error, addProduct, editProduct, removeProduct };
}

export function useProduct(id: number) {
    const [product, setProduct] = useState<ProductRead | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadedId, setLoadedId] = useState<number | null>(null);
    const loading = loadedId !== id;

    useEffect(() => {
        let cancelled = false;

        getProduct(id)
            .then((data) => {
                if (cancelled) return;
                setProduct(data);
                setError(null);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue");
            })
            .finally(() => {
                if (!cancelled) setLoadedId(id);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    return { product, loading, error };
}
