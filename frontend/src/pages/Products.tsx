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
import { CheckboxField } from "../components/CheckboxField";
import { PageHeader } from "../components/PageHeader";
import { Stamp } from "../components/Stamp";
import { Workbench } from "../components/Workbench";
import { formatMoney, formatQuantity } from "../lib/format";

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

    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
    const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));

    const columns: DataTableColumn<ProductRead>[] = [
        { header: "SKU", render: (p) => <span className="whitespace-nowrap text-ink-soft">{p.sku}</span> },
        {
            header: "Nom",
            render: (p) =>
                editingId === p.id ? (
                    <FormField id={`edit-name-${p.id}`} label="Nom" value={editName} onChange={setEditName} compact />
                ) : (
                    <Link to={`/products/${p.id}`} className="font-semibold hover:underline">
                        {p.name}
                    </Link>
                ),
        },
        { header: "Catégorie", render: (p) => categoryName(p.category_id) },
        { header: "Fournisseur", render: (p) => <span className="text-ink-soft">{supplierName(p.supplier_id)}</span> },
        {
            header: "Prix",
            align: "right",
            render: (p) =>
                editingId === p.id ? (
                    <FormField
                        id={`edit-price-${p.id}`}
                        label="Prix unitaire"
                        value={editUnitPrice}
                        onChange={setEditUnitPrice}
                        compact
                    />
                ) : (
                    <span className="whitespace-nowrap">{formatMoney(p.unit_price)}</span>
                ),
        },
        {
            header: "Stock",
            align: "right",
            render: (p) =>
                p.total_quantity <= p.reorder_threshold ? (
                    <span className="flex items-center justify-end gap-3">
                        <Stamp>Sous le seuil</Stamp>
                        <span className="text-base font-bold">{formatQuantity(p.total_quantity)}</span>
                    </span>
                ) : (
                    <span className="text-base font-bold">{formatQuantity(p.total_quantity)}</span>
                ),
        },
    ];

    return (
        <>
            <PageHeader title="Produits" />

            <Workbench
                formTitle="Nouveau produit"
                formOnTop
                form={
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
                    >
                        <FormField
                            id="sku"
                            label="SKU"
                            value={sku}
                            onChange={setSku}
                            error={errors.sku}
                            placeholder="PAIN-BIGM-001"
                            required
                        />
                        <FormField id="name" label="Nom" value={name} onChange={setName} error={errors.name} placeholder="Pain burger sésame" required />
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
                            options={categoryOptions}
                            placeholder="Choisir…"
                            error={errors.categoryId}
                        />
                        <SelectField
                            id="supplier-id"
                            label="Fournisseur"
                            value={supplierId}
                            onChange={setSupplierId}
                            options={supplierOptions}
                            placeholder="Aucun"
                        />
                        <div className="flex h-full items-end">
                            <Button type="submit" variant="primary">
                                Ajouter le produit
                            </Button>
                        </div>
                    </form>
                }
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <FormField
                        id="filter-search"
                        label="Rechercher"
                        type="search"
                        value={filters.search}
                        onChange={(value) => updateFilters({ ...filters, search: value })}
                        placeholder="Steak haché"
                    />
                    <SelectField
                        id="filter-category"
                        label="Catégorie"
                        value={filters.categoryId}
                        onChange={(value) => updateFilters({ ...filters, categoryId: value })}
                        options={categoryOptions}
                        placeholder="Toutes"
                    />
                    <SelectField
                        id="filter-supplier"
                        label="Fournisseur"
                        value={filters.supplierId}
                        onChange={(value) => updateFilters({ ...filters, supplierId: value })}
                        options={supplierOptions}
                        placeholder="Tous"
                    />
                    <CheckboxField
                        id="filter-below"
                        label="Sous le seuil uniquement"
                        checked={filters.belowThreshold}
                        onChange={(checked) => updateFilters({ ...filters, belowThreshold: checked })}
                    />
                </div>

                <ActionFeedback error={feedback.error} success={feedback.success} />
                <ErrorList errors={editErrors} />
                <StatusMessage
                    loading={loading}
                    error={error}
                    isEmpty={!loading && !error && products.length === 0}
                    emptyMessage="Aucun produit ne correspond."
                />

                {!loading && !error && products.length > 0 && (
                    <DataTable
                        columns={columns}
                        rows={products}
                        getRowId={(p) => p.id}
                        isShortage={(p) => p.total_quantity <= p.reorder_threshold}
                        renderActions={(p) =>
                            editingId === p.id ? (
                                <>
                                    <Button onClick={() => saveEdit(p.id)} variant="primary">
                                        Enregistrer
                                    </Button>
                                    <Button onClick={() => setEditingId(null)}>Annuler</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => startEdit(p)}>Modifier</Button>
                                    <Button onClick={() => handleDelete(p)} variant="danger">
                                        Supprimer
                                    </Button>
                                </>
                            )
                        }
                    />
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-ink-soft">
                        Page <span className="font-semibold text-ink">{currentPage}</span> sur {totalPages}, {total} produits
                    </span>
                    <div className="flex gap-2">
                        <Button onClick={() => setOffset(offset - PRODUCTS_PAGE_SIZE)} disabled={offset === 0}>
                            Précédent
                        </Button>
                        <Button onClick={() => setOffset(offset + PRODUCTS_PAGE_SIZE)} disabled={currentPage >= totalPages}>
                            Suivant
                        </Button>
                    </div>
                </div>
            </Workbench>
        </>
    );
}
