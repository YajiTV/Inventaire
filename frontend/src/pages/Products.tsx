import { useState } from "react";
import { Link } from "react-router-dom";
import { useProduits } from "../hooks/useProduct";
import { useCategories } from "../hooks/useCategories";
import { useFournisseurs } from "../hooks/useSuppliers";
import { EMPTY_PRODUIT_FILTERS, PRODUITS_PAGE_SIZE } from "../types/product";
import type { Produit, ProduitFilters } from "../types/product";
import { ApiError } from "../lib/api";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";

// Page CRUD produits : filtres + liste paginée + formulaire d'ajout +
// édition/suppression inline sur chaque ligne. category_id est saisi en brut
// dans le formulaire d'ajout (le sélecteur viendra avec la tâche "formulaire").
//
// Le tableau (DataTable), les champs (FormField) et les messages
// chargement/erreur/liste vide (StatusMessage) sont des composants partagés
// avec Fournisseurs.

// Même format que le backend (backend/app/schemas/product.py) : majuscules, chiffres et tirets uniquement
const SKU_PATTERN = /^[A-Z0-9-]+$/;

export default function Produits() {
    // Filtres (un seul objet) et position dans la liste (0 = page 1, 5 = page 2...)
    const [filters, setFilters] = useState<ProduitFilters>(EMPTY_PRODUIT_FILTERS);
    const [offset, setOffset] = useState(0);

    // Le hook recharge la liste dès que filters ou offset changent
    const { produits, total, loading, error, addProduit, editProduit, removeProduit } = useProduits(filters, offset);

    // Listes pour remplir les <select> de filtre et afficher les noms
    const { categories } = useCategories();
    const { fournisseurs } = useFournisseurs();

    // Champs du formulaire de création
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // Id du produit en cours d'édition (null = aucune ligne en édition)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editUnitPrice, setEditUnitPrice] = useState("");

    //Erreurs de validation, une par champ (absente = pas d'erreur)
    const [errors, setErrors] = useState<{sku?: string; name?: string; unitPrice?: string; categoryId?: string}>({});
    // Erreur renvoyée par l'API lors d'un ajout/modif/suppression (422, 409, etc.)
    const [apiError, setApiError] = useState<string | null>(null);
    // Message affiché après une action réussie
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Calcul de la pagination à partir du total renvoyé par le serveur
    const totalPages = Math.max(1, Math.ceil(total / PRODUITS_PAGE_SIZE));
    const currentPage = offset / PRODUITS_PAGE_SIZE + 1;

    // Quand un filtre change, on revient toujours à la page 1 : sinon on
    // pourrait se retrouver page 3 d'une liste qui n'a plus que 1 page.
    function updateFilters(newFilters: ProduitFilters) {
        setFilters(newFilters);
        setOffset(0);
    }

    // Retrouve le nom d'une catégorie à partir de son id (sinon on affiche l'id)
    function categoryName(id: number): string {
        return categories.find((c) => c.id === id)?.name ?? String(id);
    }

    function validate(): boolean {
        const newErrors: typeof errors = {};

        if (!sku.trim()) {
            newErrors.sku = "Le SKU est obligatoire.";
        } else if (!SKU_PATTERN.test(sku.trim())) {
            newErrors.sku = "Format de SKU invalide (majuscules, chiffres et tirets uniquement, ex: PAIN-BIGM-001).";
        }
        if (!name.trim()) newErrors.name = "Le nom est obligatoire.";
        if (!categoryId) newErrors.categoryId = "L'ID de catégorie est obligatoire.";

        const price = Number(unitPrice);
        if (!unitPrice.trim()) {
            newErrors.unitPrice = "Le prix est obligatoire.";
        } else if (Number.isNaN(price) || price <= 0) {
            newErrors.unitPrice = "Le prix doit être un nombre positif.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // true = pas d'erreurs
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);

        if (!validate()) return; // stoppe si un champ est invalide

        try {
            await addProduit({
                sku,
                name,
                unit_price: unitPrice, // plus de "|| '0'" : le prix est vérifié avant
                category_id: Number(categoryId),
                reorder_threshold: 0,
            });
            setSku("");
            setName("");
            setUnitPrice("");
            setCategoryId("");
            setErrors({});
            setSuccessMessage("Produit ajouté avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    function startEdit(p: Produit) {
        setEditingId(p.id);
        setEditName(p.name);
        setEditUnitPrice(String(p.unit_price));
    }

    async function saveEdit(id: number) {
        setApiError(null);
        setSuccessMessage(null);

        if (!editName.trim()) {
            setApiError("Le nom est obligatoire");
            return;
        }
        if (Number.isNaN(Number(editUnitPrice)) || Number(editUnitPrice) <= 0) {
            setApiError("Le prix doit être un nombre positif");
            return;
        }

        try {
            await editProduit(id, { name: editName, unit_price: editUnitPrice });
            setEditingId(null);
            setSuccessMessage("Produit modifié avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    async function handleDelete(id: number) {
        setApiError(null);
        setSuccessMessage(null);
        try {
            await removeProduit(id);
            // Si on vient de supprimer le dernier produit d'une page (autre que
            // la première), on recule d'une page pour ne pas afficher une page vide.
            if (produits.length === 1 && offset > 0) {
                setOffset(offset - PRODUITS_PAGE_SIZE);
            }
            setSuccessMessage("Produit supprimé avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    // Colonnes du DataTable : chaque render() affiche soit la valeur brute,
    // soit un FormField d'édition si la ligne est celle en cours d'édition
    // (label vide car l'en-tête de colonne fait déjà office de label).
    const columns: DataTableColumn<Produit>[] = [
        { header: "SKU", render: (p) => p.sku },
        {
            header: "Nom",
            render: (p) =>
                editingId === p.id ? (
                    <FormField id={`edit-name-${p.id}`} label="" value={editName} onChange={setEditName} />
                ) : (
                    // Le nom est un lien vers la page détail /products/:id
                    <Link to={`/products/${p.id}`} className="underline">
                        {p.name}
                    </Link>
                ),
        },
        { header: "Catégorie", render: (p) => categoryName(p.category_id) },
        {
            header: "Prix",
            render: (p) =>
                editingId === p.id ? (
                    <FormField
                        id={`edit-price-${p.id}`}
                        label=""
                        value={editUnitPrice}
                        onChange={setEditUnitPrice}
                    />
                ) : (
                    `${p.unit_price} €`
                ),
        },
        {
            header: "Stock",
            render: (p) =>
                p.total_quantity <= p.reorder_threshold ? (
                    <span className="text-red-600 dark:text-red-400">{p.total_quantity} (sous le seuil)</span>
                ) : (
                    p.total_quantity
                ),
        },
    ];

    return (
        <div className="p-4 sm:p-8">
            <h1 className="mb-6 text-2xl font-semibold">Produits</h1>

            {/* Barre de filtres : chaque changement met à jour l'objet filters,
                ce qui relance le chargement de la liste (voir useProduits) */}
            <div className="mb-4 flex flex-wrap items-end gap-2">
                <FormField
                    id="filter-search"
                    label="Rechercher"
                    value={filters.search}
                    onChange={(value) => updateFilters({ ...filters, search: value })}
                    placeholder="Nom, SKU ou code-barres"
                />
                <div className="flex flex-col">
                    <label htmlFor="filter-category">Catégorie</label>
                    <select
                        id="filter-category"
                        value={filters.categoryId}
                        onChange={(e) => updateFilters({ ...filters, categoryId: e.target.value })}
                        className="border rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    >
                        <option value="">Toutes</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="filter-supplier">Fournisseur</label>
                    <select
                        id="filter-supplier"
                        value={filters.supplierId}
                        onChange={(e) => updateFilters({ ...filters, supplierId: e.target.value })}
                        className="border rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    >
                        <option value="">Tous</option>
                        {fournisseurs.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>
                <label className="flex items-center gap-2 py-1">
                    <input
                        type="checkbox"
                        checked={filters.belowThreshold}
                        onChange={(e) => updateFilters({ ...filters, belowThreshold: e.target.checked })}
                    />
                    Sous le seuil uniquement
                </label>
            </div>

            <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
                <FormField
                    id="sku"
                    label="SKU"
                    value={sku}
                    onChange={setSku}
                    error={errors.sku}
                    placeholder="PAIN-BIGM-001"
                    required
                />
                <FormField id="name" label="Nom" value={name} onChange={setName} error={errors.name} required />
                <FormField
                    id="unit-price"
                    label="Prix unitaire"
                    value={unitPrice}
                    onChange={setUnitPrice}
                    error={errors.unitPrice}
                />
                <FormField
                    id="category-id"
                    label="ID catégorie"
                    value={categoryId}
                    onChange={setCategoryId}
                    error={errors.categoryId}
                    required
                />
                <button type="submit" className="self-end border rounded px-3 py-1 dark:border-gray-600">
                    Ajouter
                </button>
            </form>

            <StatusMessage
                loading={loading}
                error={error}
                isEmpty={!loading && !error && produits.length === 0}
                emptyMessage="Aucun produit ne correspond"
            />
            {apiError && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    {apiError}
                </p>
            )}
            {successMessage && <p className="text-green-600 dark:text-green-400">{successMessage}</p>}

            {!loading && !error && produits.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={produits}
                    getRowId={(p) => p.id}
                    renderActions={(p) =>
                        editingId === p.id ? (
                            <>
                                <button onClick={() => saveEdit(p.id)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Enregistrer</button>
                                <button onClick={() => setEditingId(null)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => startEdit(p)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Modifier</button>
                                <button onClick={() => handleDelete(p.id)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Supprimer</button>
                            </>
                        )
                    }
                />
            )}

            {/* Pagination : Précédent/Suivant modifient offset, le hook recharge la page */}
            <div className="mt-4 flex items-center gap-4">
                <button
                    onClick={() => setOffset(offset - PRODUITS_PAGE_SIZE)}
                    disabled={offset === 0}
                    className="border rounded px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                >
                    Précédent
                </button>
                <span>
                    Page {currentPage} / {totalPages} ({total} produits)
                </span>
                <button
                    onClick={() => setOffset(offset + PRODUITS_PAGE_SIZE)}
                    disabled={currentPage >= totalPages}
                    className="border rounded px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
