import { useState } from "react";
import { Link } from "react-router-dom";
import { useProduits } from "../hooks/useProduits";
import type { Produit } from "../types/produit";

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
            <p>
                <Link to="/">← Retour</Link>
            </p>
            <h1>Produits</h1>

            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}
            >
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
            {error && <p style={{ color: "red" }}>{error}</p>}

            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>SKU</th>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Nom</th>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Prix</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {produits.map((p) => (
                        <tr key={p.id}>
                            {editingId === p.id ? (
                                <>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{p.sku}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>
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
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{p.sku}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{p.name}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{p.unit_price} €</td>
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
