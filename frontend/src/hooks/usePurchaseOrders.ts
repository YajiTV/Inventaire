import { useEffect, useState } from "react";
import { getPurchaseOrders } from "../api/purchaseOrders";
import type { PurchaseOrderRead } from "../types/api";

export function usePurchaseOrders(): { orders: PurchaseOrderRead[]; loading: boolean; error: string | null } {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<PurchaseOrderRead[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPurchaseOrders()
            .then(data => setOrders(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);
    return { orders, loading, error };
}
