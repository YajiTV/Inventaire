import { useEffect, useState } from "react";
import {
    getProduits,
    getProduit,
    createProduit,
    updateProduit,
    deleteProduit,
} from "../api/products";
import { EMPTY_PRODUIT_FILTERS } from "../types/product";
import type { Produit, ProduitCreate, ProduitFilters, ProduitUpdate } from "../types/product";

// Hook de la liste des produits : récupère UNE page de produits filtrée.
// Les paramètres sont facultatifs : useProduits() sans argument (comme dans la
// page Stocks) charge simplement la première page sans filtre.
export function useProduits(filters: ProduitFilters = EMPTY_PRODUIT_FILTERS, offset = 0) {
    // Les produits de la page courante
    const [produits, setProduits] = useState<Produit[]>([]);
    // Nombre total de produits correspondant aux filtres (toutes pages confondues)
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    // Compteur qu'on incrémente pour forcer un rechargement (après un ajout
    // ou une suppression, la page affichée doit être recalculée par le serveur)
    const [reloadKey, setReloadKey] = useState(0);

    // Chargement déduit plutôt que stocké : on compare la requête demandée
    // (filtres + page + reloadKey) à la dernière requête terminée.
    const requestKey = JSON.stringify([filters, offset, reloadKey]);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const loading = loadedKey !== requestKey;

    // Le tableau de dépendances contient les filtres, la page et reloadKey :
    // dès que l'un des trois change, l'effet se relance et recharge la liste.
    useEffect(() => {
        // Drapeau anti "réponse en retard" : si l'utilisateur change de filtre
        // avant que la réponse précédente n'arrive, on ignore l'ancienne réponse.
        let cancelled = false;

        getProduits(filters, offset)
            .then((page) => {
                if (cancelled) return;
                setProduits(page.items);
                setTotal(page.total);
                setError(null);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue");
            })
            .finally(() => {
                if (!cancelled) setLoadedKey(requestKey);
            });

        // Fonction de nettoyage : exécutée avant le prochain effet ou au démontage
        return () => {
            cancelled = true;
        };
    }, [filters, offset, reloadKey, requestKey]);

    // Création : on recharge la liste plutôt que d'ajouter à la main, car le
    // nouveau produit peut ne pas appartenir à la page/aux filtres affichés.
    async function addProduit(data: ProduitCreate) {
        await createProduit(data);
        setReloadKey((k) => k + 1);
    }

    // Modification : la ligne reste à sa place, on remplace juste l'objet
    async function editProduit(id: number, data: ProduitUpdate) {
        const maj = await updateProduit(id, data);
        setProduits((prev) => prev.map((p) => (p.id === id ? maj : p)));
    }

    // Suppression : on recharge pour que la page soit re-remplie par le serveur
    async function removeProduit(id: number) {
        await deleteProduit(id);
        setReloadKey((k) => k + 1);
    }

    return { produits, total, loading, error, addProduit, editProduit, removeProduit };
}

// Hook de la page détail : récupère un seul produit à partir de son id
// (l'id vient de l'URL /products/:id, lu avec useParams dans la page).
export function useProduit(id: number) {
    const [produit, setProduit] = useState<Produit | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Même principe que useProduits : en chargement tant que l'id affiché n'est pas celui chargé
    const [loadedId, setLoadedId] = useState<number | null>(null);
    const loading = loadedId !== id;

    useEffect(() => {
        let cancelled = false;

        getProduit(id)
            .then((data) => {
                if (cancelled) return;
                setProduit(data);
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

    return { produit, loading, error };
}
