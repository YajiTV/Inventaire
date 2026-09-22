import { apiFetch } from "../lib/api";
import type { PurchaseOrderRead } from "../types/api";

export async function getPurchaseOrders(): Promise<PurchaseOrderRead[]> {
    const response = await apiFetch("/purchase-orders");
    return response.json();
}

export async function getPurchaseOrder(id: number): Promise<PurchaseOrderRead> {
    const response = await apiFetch(`/purchase-orders/${id}`);
    return response.json();
}
