import { useEffect, useState } from "react";
import { getPurchaseOrder } from "../api/purchaseOrders";
import type { PurchaseOrderRead } from "../types/api";

export function usePurchaseOrder(id: number): {
    order: PurchaseOrderRead | null;
    loading: boolean;
    error: string | null;
} {
    const [order, setOrder] = useState<PurchaseOrderRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPurchaseOrder(id)
            .then(data => setOrder(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);
    return { order, loading, error };
}
