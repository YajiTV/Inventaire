import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSuppliers } from "../hooks/useSuppliers";
import { EMPTY_PRODUCT_FILTERS, PRODUCTS_PAGE_SIZE } from "../lib/products";
import type { ProductFilters } from "../lib/products";
import type { ProductRead } from "../types/api";
import { useActionFeedback } from "../hooks/useActionFeedback";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { SelectField } from "../components/SelectField";
import { StatusMessage } from "../components/StatusMessage";
import { ActionFeedback } from "../components/ActionFeedback";
import { ErrorList } from "../components/ErrorList";
import { Button } from "../components/Button";

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
    const [supplierId, setSupplierId] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editUnitPrice, setEditUnitPrice] = useState("");

    const [errors, setErrors] = useState<{sku?: string; name?: string; unitPrice?: string; categoryId?: string}>({});
    const [editErrors, setEditErrors] = useState<string[]>([]);
    const feedback = useActionFeedback();

    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
    const currentPage = offset / PRODUCTS_PAGE_SIZE + 1;

    function updateFilters(newFilters: ProductFilters) {
        setFilters(newFilters);
        setOffset(0);
    }

    function categoryName(id: number): string {
        return categories.find((c) => c.id === id)?.name ?? "";
    }

    function supplierName(id: number | null | undefined): string {
        return suppliers.find((s) => s.id === id)?.name ?? "Aucun";
    }

    function validate(): boolean {
        const newErrors: typeof errors = {};

        if (!sku.trim()) {
            newErrors.sku = "Le SKU est obligatoire.";
        } else if (!SKU_PATTERN.test(sku.trim())) {
            newErrors.sku = "Format de SKU invalide (majuscules, chiffres et tirets uniquement, ex: PAIN-BIGM-001).";
        }
        if (!name.trim()) newErrors.name = "Le nom est obligatoire.";
        if (!categoryId) newErrors.categoryId = "La catégorie est obligatoire.";

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
        feedback.clear();

        if (!validate()) return;

        const added = await feedback.run(
            () =>
                addProduct({
                    sku: sku.trim(),
                    name: name.trim(),
                    unit_price: unitPrice,
                    category_id: Number(categoryId),
                    supplier_id: supplierId === "" ? null : Number(supplierId),
                    reorder_threshold: 0,
                }),
            "Produit ajouté avec succès.",
        );
        if (added) {
            setSku("");
            setName("");
            setUnitPrice("");
            setCategoryId("");
            setSupplierId("");
        }
    }

    function startEdit(p: ProductRead) {
        setEditingId(p.id);
        setEditName(p.name);
        setEditUnitPrice(String(p.unit_price));
        setEditErrors([]);
    }

    async function saveEdit(id: number) {
        const found: string[] = [];
        if (!editName.trim()) found.push("Le nom est obligatoire.");
        if (Number.isNaN(Number(editUnitPrice)) || Number(editUnitPrice) <= 0) {
            found.push("Le prix doit être un nombre positif.");
        }
        setEditErrors(found);
        if (found.length > 0) return;

        const saved = await feedback.run(
            () => editProduct(id, { name: editName.trim(), unit_price: editUnitPrice }),
            "Produit modifié avec succès.",
        );
        if (saved) setEditingId(null);
    }

    async function handleDelete(p: ProductRead) {
        if (!window.confirm(`Supprimer le produit "${p.name}" ?`)) return;

        const deleted = await feedback.run(() => removeProduct(p.id), "Produit supprimé avec succès.");
        // Deleted the last item of a page: go back one page instead of showing an empty one
        if (deleted && products.length === 1 && offset > 0) {
            setOffset(offset - PRODUCTS_PAGE_SIZE);
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
        { header: "Fournisseur", render: (p) => supplierName(p.supplier_id) },
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
                <SelectField
                    id="filter-category"
                    label="Catégorie"
                    value={filters.categoryId}
                    onChange={(value) => updateFilters({ ...filters, categoryId: value })}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Toutes"
                />
                <SelectField
                    id="filter-supplier"
                    label="Fournisseur"
                    value={filters.supplierId}
                    onChange={(value) => updateFilters({ ...filters, supplierId: value })}
                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder="Tous"
                />
                <label className="flex items-center gap-2 py-1">
                    <input
                        type="checkbox"
                        checked={filters.belowThreshold}
                        onChange={(e) => updateFilters({ ...filters, belowThreshold: e.target.checked })}
                    />
                    Sous le seuil uniquement
                </label>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mb-4 flex flex-wrap gap-2">
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
                    placeholder="1.50"
                    required
                />
                <SelectField
                    id="category-id"
                    label="Catégorie"
                    value={categoryId}
                    onChange={setCategoryId}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Choisir..."
                    error={errors.categoryId}
                />
                <SelectField
                    id="supplier-id"
                    label="Fournisseur"
                    value={supplierId}
                    onChange={setSupplierId}
                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder="Aucun"
                />
                <Button type="submit">Ajouter</Button>
            </form>

            <StatusMessage
                loading={loading}
                error={error}
                isEmpty={!loading && !error && products.length === 0}
                emptyMessage="Aucun produit ne correspond"
            />
            <ActionFeedback error={feedback.error} success={feedback.success} />
            <ErrorList errors={editErrors} />

            {!loading && !error && products.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={products}
                    getRowId={(p) => p.id}
                    renderActions={(p) =>
                        editingId === p.id ? (
                            <>
                                <Button onClick={() => saveEdit(p.id)}>Enregistrer</Button>
                                <Button onClick={() => setEditingId(null)}>Annuler</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => startEdit(p)}>Modifier</Button>
                                <Button onClick={() => handleDelete(p)}>Supprimer</Button>
                            </>
                        )
                    }
                />
            )}

            <div className="mt-4 flex items-center gap-4">
                <Button onClick={() => setOffset(offset - PRODUCTS_PAGE_SIZE)} disabled={offset === 0}>
                    Précédent
                </Button>
                <span>
                    Page {currentPage} / {totalPages} ({total} produits)
                </span>
                <Button onClick={() => setOffset(offset + PRODUCTS_PAGE_SIZE)} disabled={currentPage >= totalPages}>
                    Suivant
                </Button>
            </div>
        </div>
    );
}
