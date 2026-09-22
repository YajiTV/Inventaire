import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSuppliers } from "../hooks/useSuppliers";
import { EMPTY_PRODUCT_FILTERS, PRODUCTS_PAGE_SIZE } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead } from "../types/api";
import { ApiError } from "../lib/api";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";

const SKU_PATTERN = /^[A-Z0-9-]+$/;

export default function Products() {
    const [filters, setFilters] = useState<ProductFilters>(EMPTY_PRODUCT_FILTERS);
    const [offset, setOffset] = useState(0);

    const { products, total, loading, error, addProduct, editProduct, removeProduct } = useProducts(filters, offset);

    const { categories } = useCategories();
    const { suppliers } = useSuppliers();

    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editUnitPrice, setEditUnitPrice] = useState("");

    const [errors, setErrors] = useState<{sku?: string; name?: string; unitPrice?: string; categoryId?: string}>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
    const currentPage = offset / PRODUCTS_PAGE_SIZE + 1;

    function updateFilters(newFilters: ProductFilters) {
        setFilters(newFilters);
        setOffset(0);
    }

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
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);

        if (!validate()) return;

        try {
            await addProduct({
                sku,
                name,
                unit_price: unitPrice,
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

    function startEdit(p: ProductRead) {
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
            await editProduct(id, { name: editName, unit_price: editUnitPrice });
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
            await removeProduct(id);
            // Deleted the last item of a page: go back one page instead of showing an empty one
            if (products.length === 1 && offset > 0) {
                setOffset(offset - PRODUCTS_PAGE_SIZE);
            }
            setSuccessMessage("Produit supprimé avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    const columns: DataTableColumn<ProductRead>[] = [
        { header: "SKU", render: (p) => p.sku },
        {
            header: "Nom",
            render: (p) =>
                editingId === p.id ? (
                    <FormField id={`edit-name-${p.id}`} label="" value={editName} onChange={setEditName} />
                ) : (
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
                        {suppliers.map((f) => (
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
                isEmpty={!loading && !error && products.length === 0}
                emptyMessage="Aucun produit ne correspond"
            />
            {apiError && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    {apiError}
                </p>
            )}
            {successMessage && <p className="text-green-600 dark:text-green-400">{successMessage}</p>}

            {!loading && !error && products.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={products}
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

            <div className="mt-4 flex items-center gap-4">
                <button
                    onClick={() => setOffset(offset - PRODUCTS_PAGE_SIZE)}
                    disabled={offset === 0}
                    className="border rounded px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                >
                    Précédent
                </button>
                <span>
                    Page {currentPage} / {totalPages} ({total} produits)
                </span>
                <button
                    onClick={() => setOffset(offset + PRODUCTS_PAGE_SIZE)}
                    disabled={currentPage >= totalPages}
                    className="border rounded px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
