import { useState } from "react";
import { useProduits } from "../hooks/useProduct";
import type { Produit } from "../types/product";
import { ApiError } from "../lib/api";

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

    return (
        <div className="p-8">
            <h1>Produits</h1>

            <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
                <div>
                    <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
                    {errors.sku && <p className="text-red-600 text-sm">{errors.sku}</p>}
                </div>
                <div>
                    <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div>
                    <input
                        placeholder="Prix unitaire"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                    />
                    {errors.unitPrice && <p className="text-red-600 text-sm">{errors.unitPrice}</p>}
                </div>
                <div>
                    <input
                        placeholder="ID catégorie"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    />
                    {errors.categoryId && <p className="text-red-600 text-sm">{errors.categoryId}</p>}
                </div>
                <button type="submit">Ajouter</button>
            </form>

            {loading && <p>Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {apiError && <p role="alert" className="text-red-600">{apiError}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="py-1 pr-6 text-left">SKU</th>
                        <th className="py-1 pr-6 text-left">Nom</th>
                        <th className="py-1 pr-6 text-left">Prix</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {produits.map((p) => (
                        <tr key={p.id}>
                            {editingId === p.id ? (
                                <>
                                    <td className="py-1 pr-6 text-left">{p.sku}</td>
                                    <td className="py-1 pr-6 text-left">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </td>
                                    <td className="py-1 pr-6 text-left">
                                        <input
                                            value={editUnitPrice}
                                            onChange={(e) => setEditUnitPrice(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => saveEdit(p.id)}>Enregistrer</button>
                                        <button onClick={() => setEditingId(null)}>Annuler</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="py-1 pr-6 text-left">{p.sku}</td>
                                    <td className="py-1 pr-6 text-left">{p.name}</td>
                                    <td className="py-1 pr-6 text-left">{p.unit_price} €</td>
                                    <td>
                                        <button onClick={() => startEdit(p)}>Modifier</button>
                                        <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
