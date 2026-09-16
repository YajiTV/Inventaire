import type { Produit } from "../types/produit";

const URL = "http://localhost:8000/produits";

export async function getProduits(): Promise<Produit[]> {
    const res = await fetch(URL);
    if (!res.ok) throw new Error("Erreur chargement produits");
    return res.json();
}

export async function createProduit(data: { nom: string }): Promise<Produit> {
    const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création produit");
    return res.json();
}

export async function updateProduit(id: number, data: { nom: string }): Promise<Produit> {
    const res = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur modification produit");
    return res.json();
}

export async function deleteProduit(id: number): Promise<void> {
    const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression produit");
}
