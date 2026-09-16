import { apiFetch } from "../lib/api";
import type { Fournisseur, FournisseurCreate, FournisseurUpdate } from "../types/fournisseur";

export async function getFournisseurs(): Promise<Fournisseur[]> {
    const res = await apiFetch("/suppliers");
    return res.json();
}

export async function createFournisseur(data: FournisseurCreate): Promise<Fournisseur> {
    const res = await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateFournisseur(id: number, data: FournisseurUpdate): Promise<Fournisseur> {
    const res = await apiFetch(`/suppliers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteFournisseur(id: number): Promise<void> {
    await apiFetch(`/suppliers/${id}`, { method: "DELETE" });
}
