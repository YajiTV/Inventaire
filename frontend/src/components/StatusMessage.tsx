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
