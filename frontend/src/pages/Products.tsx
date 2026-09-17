import { useState } from "react";
import { useProduits } from "../hooks/useProduct";
import type { Produit } from "../types/product";

// Page CRUD produits : liste + formulaire d'ajout + édition/suppression
// inline sur chaque ligne. category_id est saisi en brut (id d'une catégorie
// déjà créée côté /categories) : pas de sélecteur, la gestion des
// catégories est hors du périmètre de cette page.
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!sku.trim() || !name.trim() || !categoryId) return;
        await addProduit({
            sku,
            name,
            unit_price: unitPrice || "0",
            category_id: Number(categoryId),
            reorder_threshold: 0,
        });
        setSku("");
        setName("");
        setUnitPrice("");
        setCategoryId("");
    }

    function startEdit(p: Produit) {
        setEditingId(p.id);
        setEditName(p.name);
        setEditUnitPrice(String(p.unit_price));
    }

    async function saveEdit(id: number) {
        if (!editName.trim()) return;
        await editProduit(id, { name: editName, unit_price: editUnitPrice });
        setEditingId(null);
    }

    return (
        <div className="p-8">
            <h1>Produits</h1>

            <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
                <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
                <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                <input
                    placeholder="Prix unitaire"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                />
                <input
                    placeholder="ID catégorie"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                />
                <button type="submit">Ajouter</button>
            </form>

            {loading && <p>Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}

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
                                        <button onClick={() => removeProduit(p.id)}>Supprimer</button>
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
