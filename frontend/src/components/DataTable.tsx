import type { ReactNode } from "react";

// Colonne générique d'un DataTable : un titre affiché dans le <thead>, et une
// fonction render() qui sait comment afficher la valeur de cette colonne pour
// une ligne T donnée. C'est render() qui décide d'afficher du texte brut ou
// un input d'édition (via FormField) : DataTable lui-même ne connaît rien à
// l'édition, il pose juste la grille lignes x colonnes + une colonne actions.
export interface DataTableColumn<T> {
    header: string;
    render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    // Les colonnes à afficher, dans l'ordre.
    columns: DataTableColumn<T>[];
    // Les lignes de données (produits, fournisseurs, catégories, ...).
    rows: T[];
    // Comment extraire une clé unique d'une ligne, pour la prop "key" de React.
    getRowId: (row: T) => number | string;
    // Contenu de la dernière colonne (boutons Modifier/Supprimer ou
    // Enregistrer/Annuler selon si la ligne est en cours d'édition).
    renderActions: (row: T) => ReactNode;
}

// Tableau générique paramétré par T : le même composant sert pour Produits,
// Fournisseurs et Catégories, seules les colonnes et le rendu des actions
// changent d'une page à l'autre.
export function DataTable<T>({ columns, rows, getRowId, renderActions }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto rounded border dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.header} className="px-3 py-2 font-medium">
                                {column.header}
                            </th>
                        ))}
                        <th className="px-3 py-2 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={getRowId(row)} className="border-t dark:border-gray-700">
                            {columns.map((column) => (
                                <td key={column.header} className="px-3 py-2">
                                    {column.render(row)}
                                </td>
                            ))}
                            <td className="px-3 py-2">
                                <div className="flex gap-2">{renderActions(row)}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
