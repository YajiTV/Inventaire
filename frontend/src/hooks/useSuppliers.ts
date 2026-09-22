import { useEffect, useState } from "react";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../api/suppliers";
import type { SupplierRead, SupplierCreate, SupplierUpdate } from "../types/api";

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<SupplierRead[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getSuppliers()
            .then((data) => setSuppliers(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function addSupplier(data: SupplierCreate) {
        const nouveau = await createSupplier(data);
        setSuppliers((prev) => [...prev, nouveau]);
    }

    async function editSupplier(id: number, data: SupplierUpdate) {
        const maj = await updateSupplier(id, data);
        setSuppliers((prev) => prev.map((f) => (f.id === id ? maj : f)));
    }

    async function removeSupplier(id: number) {
        await deleteSupplier(id);
        setSuppliers((prev) => prev.filter((f) => f.id !== id));
    }

    return {
        suppliers,
        loading,
        error,
        addSupplier,
        editSupplier,
        removeSupplier,
    };
}
