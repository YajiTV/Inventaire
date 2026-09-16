import {useEffect, useState} from "react";
import {
    getProduits,
    createProduit,
    updateProduit,
    deleteProduit,
} from "../api/produits";
import type { Produit } from "../types/produit";

export function useProduits() {
    const [produits, setProduits] = useState<Produit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProduits()
            .then((data) => setProduits(data))
            .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
            .finally(() => setLoading(false));
    }, []);

    async function addProduit(data: { nom: string }) {
        const nouveau = await createProduit(data);
        setProduits((prev) => [...prev, nouveau]);
    }

    async function editProduit(id: number, data: { nom: string }) {
        const maj = await updateProduit(id, data);
        setProduits((prev) => prev.map((p) => (p.id === id ? maj : p)));
    }

    async function removeProduit(id: number) {
        await deleteProduit(id);
        setProduits((prev) => prev.filter((p) => p.id !== id));
    }

    return { produits, loading, error, addProduit, editProduit, removeProduit };
}