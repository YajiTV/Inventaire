import { apiFetch } from "../lib/api";
import type { SupplierRead, SupplierCreate, SupplierUpdate } from "../types/api";

export async function getSuppliers(): Promise<SupplierRead[]> {
    const res = await apiFetch("/suppliers");
    return res.json();
}

export async function createSupplier(data: SupplierCreate): Promise<SupplierRead> {
    const res = await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateSupplier(id: number, data: SupplierUpdate): Promise<SupplierRead> {
    const res = await apiFetch(`/suppliers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
    await apiFetch(`/suppliers/${id}`, { method: "DELETE" });
}
