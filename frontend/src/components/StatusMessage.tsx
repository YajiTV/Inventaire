// Message d'état réutilisable pour une page de liste (produits, fournisseurs,
// catégories, ...) : affiche soit le chargement, soit une erreur, soit un
// message "liste vide", dans cet ordre de priorité. N'affiche rien si aucun
// des trois cas ne s'applique (données chargées, sans erreur, non vides) :
// c'est dans ce cas-là que la page appelante doit afficher son DataTable.
interface StatusMessageProps {
    loading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    emptyMessage?: string;
}

export function StatusMessage({ loading, error, isEmpty, emptyMessage = "Aucun élément" }: StatusMessageProps) {
    if (loading) {
        return <p>Chargement...</p>;
    }

    if (error) {
        return (
            <p role="alert" className="text-red-600 dark:text-red-400">
                {error}
            </p>
        );
    }

    if (isEmpty) {
        return <p>{emptyMessage}</p>;
    }

    return null;
}
