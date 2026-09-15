import type { Fournisseur } from "../types/fournisseur";

const URL = "http://localhost:8000/fournisseurs";

export async function getFournisseurs(): Promise<Fournisseur[]> {
    const res = await fetch(URL);
    if (!res.ok) throw new Error("Erreur chargement fournisseurs");
    return res.json();
}

export async function createFournisseur(data: { nom: string }): Promise<Fournisseur> {
    const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création fournisseur");
    return res.json();
}

export async function updateFournisseur(id: number, data: { nom: string }): Promise<Fournisseur> {
    const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur modification fournisseur");
    return res.json();
}

export async function deleteFournisseur(id: number): Promise<void> {
    const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression fournisseur");
}
