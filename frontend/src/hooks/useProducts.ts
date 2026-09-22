import { useEffect, useState } from "react";
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../api/products";
import { EMPTY_PRODUCT_FILTERS } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead, ProductCreate, ProductUpdate } from "../types/api";

// Hook de la liste des produits : récupère UNE page de produits filtrée.
// Les paramètres sont facultatifs : useProducts() sans argument (comme dans la
// page Stocks) charge simplement la première page sans filtre.
export function useProducts(filters: ProductFilters = EMPTY_PRODUCT_FILTERS, offset = 0) {
    // Les produits de la page courante
    const [products, setProducts] = useState<ProductRead[]>([]);
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

        getProducts(filters, offset)
            .then((page) => {
                if (cancelled) return;
                setProducts(page.items);
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
    async function addProduct(data: ProductCreate) {
        await createProduct(data);
        setReloadKey((k) => k + 1);
    }

    // Modification : la ligne reste à sa place, on remplace juste l'objet
    async function editProduct(id: number, data: ProductUpdate) {
        const maj = await updateProduct(id, data);
        setProducts((prev) => prev.map((p) => (p.id === id ? maj : p)));
    }

    // Suppression : on recharge pour que la page soit re-remplie par le serveur
    async function removeProduct(id: number) {
        await deleteProduct(id);
        setReloadKey((k) => k + 1);
    }

    return { products, total, loading, error, addProduct, editProduct, removeProduct };
}

// Hook de la page détail : récupère un seul produit à partir de son id
// (l'id vient de l'URL /products/:id, lu avec useParams dans la page).
export function useProduct(id: number) {
    const [product, setProduct] = useState<ProductRead | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Même principe que useProducts : en chargement tant que l'id affiché n'est pas celui chargé
    const [loadedId, setLoadedId] = useState<number | null>(null);
    const loading = loadedId !== id;

    useEffect(() => {
        let cancelled = false;

        getProduct(id)
            .then((data) => {
                if (cancelled) return;
                setProduct(data);
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

    return { product, loading, error };
}
