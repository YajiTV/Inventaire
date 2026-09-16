import { useState } from "react";
import { Link } from "react-router-dom";
import { useFournisseurs } from "../hooks/useSuppliers";
import type { Fournisseur } from "../types/supplier";

// Page CRUD fournisseurs : liste + formulaire d'ajout + édition/suppression
// inline sur chaque ligne. Pas de librairie de formulaire, juste du useState
// simple pour rester lisible pour la fiche de révision React/TS.
export default function Fournisseurs() {
    const { fournisseurs, loading, error, addFournisseur, editFournisseur, removeFournisseur } =
        useFournisseurs();

    // Champs du formulaire de création
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Id du fournisseur en cours d'édition (null = aucune ligne en édition)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        await addFournisseur({
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
        });
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
    }

    function startEdit(f: Fournisseur) {
        setEditingId(f.id);
        setEditName(f.name);
    }

    async function saveEdit(id: number) {
        if (!editName.trim()) return;
        await editFournisseur(id, { name: editName });
        setEditingId(null);
    }

    return (
        <div className="p-8">
            <p>
                <Link to="/">← Retour</Link>
            </p>
            <h1>Fournisseurs</h1>

            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}
            >
                <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
                <button type="submit">Ajouter</button>
            </form>

            {loading && <p>Chargement...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Nom</th>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Email</th>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Téléphone</th>
                        <th style={{ textAlign: "left", padding: "0.25rem 1.5rem 0.25rem 0" }}>Adresse</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {fournisseurs.map((f) => (
                        <tr key={f.id}>
                            {editingId === f.id ? (
                                <>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.email}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.phone}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.address}</td>
                                    <td>
                                        <button onClick={() => saveEdit(f.id)}>Enregistrer</button>
                                        <button onClick={() => setEditingId(null)}>Annuler</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.name}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.email}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.phone}</td>
                                    <td style={{ padding: "0.25rem 1.5rem 0.25rem 0" }}>{f.address}</td>
                                    <td>
                                        <button onClick={() => startEdit(f)}>Modifier</button>
                                        <button onClick={() => removeFournisseur(f.id)}>Supprimer</button>
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
