import { useEffect, useState } from "react";
import {
    getFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
} from "../api/suppliers";
import type { Fournisseur, FournisseurCreate, FournisseurUpdate } from "../types/supplier";

export function useFournisseurs() {
    // La liste des fournisseurs récupérée depuis l'API.
    // On l'initialise à [] (tableau vide) en attendant la réponse du serveur.
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);

    // true pendant le chargement initial (le tout premier fetch au montage).
    // Sert à afficher un message "Chargement..." côté page.
    const [loading, setLoading] = useState(true);

    // Contient un message d'erreur si le fetch a échoué, sinon null.
    const [error, setError] = useState<string | null>(null);

    // useEffect avec un tableau de dépendances vide [] = exécuté une seule
    // fois, juste après le premier rendu du composant qui utilise ce hook.
    // C'est ici qu'on va chercher les fournisseurs au chargement de la page.
    useEffect(() => {
        getFournisseurs()
            .then((data) => setFournisseurs(data)) // succès -> on stocke les données
            .catch((err) => setError(err.message)) // échec -> on stocke le message d'erreur
            .finally(() => setLoading(false)); // dans tous les cas -> chargement terminé
    }, []);

    // --- Fonctions exposées par le hook ---
    // Ces fonctions appellent l'API puis mettent à jour l'état local
    // "fournisseurs" à la main (pas de refetch automatique : on ajoute/
    // retire/remplace juste l'élément concerné dans le tableau existant).

    // Ajoute un nouveau fournisseur : on l'envoie au serveur, puis on
    // récupère l'objet créé (avec son id généré par la base) pour
    // l'ajouter à la liste affichée.
    async function addFournisseur(data: FournisseurCreate) {
        const nouveau = await createFournisseur(data);
        setFournisseurs((prev) => [...prev, nouveau]);
    }

    // Modifie un fournisseur existant : on envoie les nouvelles données,
    // puis on remplace l'ancien objet par le nouveau dans le tableau
    // (on repère l'élément à remplacer grâce à son id).
    async function editFournisseur(id: number, data: FournisseurUpdate) {
        const maj = await updateFournisseur(id, data);
        setFournisseurs((prev) => prev.map((f) => (f.id === id ? maj : f)));
    }

    // Supprime un fournisseur : on demande la suppression côté serveur,
    // puis on retire l'élément correspondant du tableau local avec filter
    // (filter garde tous les éléments SAUF celui dont l'id correspond).
    async function removeFournisseur(id: number) {
        await deleteFournisseur(id);
        setFournisseurs((prev) => prev.filter((f) => f.id !== id));
    }

    // Le hook renvoie un objet : la page qui l'utilise choisit ce dont
    // elle a besoin grâce à la déstructuration, ex :
    // const { fournisseurs, loading } = useFournisseurs();
    return {
        fournisseurs,
        loading,
        error,
        addFournisseur,
        editFournisseur,
        removeFournisseur,
    };
}
