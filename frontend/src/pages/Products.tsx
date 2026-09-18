import { useState } from "react";
import { useProduits } from "../hooks/useProduct";
import type { Produit } from "../types/product";
import { ApiError } from "../lib/api";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";

// Page CRUD produits : liste + formulaire d'ajout + édition/suppression
// inline sur chaque ligne. category_id est saisi en brut (id d'une catégorie
// déjà créée côté /categories) : pas de sélecteur, la gestion des
// catégories est hors du périmètre de cette page.
//
// Le tableau (DataTable), les champs (FormField) et les messages
// chargement/erreur/liste vide (StatusMessage) sont des composants partagés
// avec Fournisseurs, pour ne pas dupliquer la structure "form + table +
// édition inline" entre les deux pages.

// Même format que le backend (backend/app/schemas/product.py) : majuscules, chiffres et tirets uniquement
const SKU_PATTERN = /^[A-Z0-9-]+$/;

export default function Produits() {
    const { produits, loading, error, addProduit, editProduit, removeProduit } = useProduits();

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
                    p.name
                ),
        },
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
    ];

    return (
        <div className="p-8">
            <h1>Produits</h1>

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
                <button type="submit" className="self-end border rounded px-3 py-1">
                    Ajouter
                </button>
            </form>

            <StatusMessage
                loading={loading}
                error={error}
                isEmpty={!loading && !error && produits.length === 0}
                emptyMessage="Aucun produit"
            />
            {apiError && (
                <p role="alert" className="text-red-600">
                    {apiError}
                </p>
            )}
            {successMessage && <p className="text-green-600">{successMessage}</p>}

            {!loading && !error && produits.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={produits}
                    getRowId={(p) => p.id}
                    renderActions={(p) =>
                        editingId === p.id ? (
                            <>
                                <button onClick={() => saveEdit(p.id)}>Enregistrer</button>
                                <button onClick={() => setEditingId(null)}>Annuler</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => startEdit(p)}>Modifier</button>
                                <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                            </>
                        )
                    }
                />
            )}
        </div>
    );
}
