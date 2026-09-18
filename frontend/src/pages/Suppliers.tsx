import { useState } from "react";
import { useFournisseurs } from "../hooks/useSuppliers";
import type { Fournisseur } from "../types/supplier";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";

// Page CRUD fournisseurs : liste + formulaire d'ajout + édition/suppression
// inline sur chaque ligne. Pas de librairie de formulaire, juste du useState
// simple pour rester lisible pour la fiche de révision React/TS.
//
// Le tableau (DataTable), les champs (FormField) et les messages
// chargement/erreur/liste vide (StatusMessage) sont des composants partagés
// avec Produits, pour ne pas dupliquer la structure "form + table +
// édition inline" entre les deux pages.
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

    // Colonnes du DataTable : seule "Nom" est éditable inline (comportement
    // identique à la version précédente), les autres colonnes sont en lecture
    // seule dans ce tableau.
    const columns: DataTableColumn<Fournisseur>[] = [
        {
            header: "Nom",
            render: (f) =>
                editingId === f.id ? (
                    <FormField id={`edit-name-${f.id}`} label="" value={editName} onChange={setEditName} />
                ) : (
                    f.name
                ),
        },
        { header: "Email", render: (f) => f.email },
        { header: "Téléphone", render: (f) => f.phone },
        { header: "Adresse", render: (f) => f.address },
    ];

    return (
        <div className="p-8">
            <h1>Fournisseurs</h1>

            <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
                <FormField id="name" label="Nom" value={name} onChange={setName} required />
                <FormField id="email" label="Email" value={email} onChange={setEmail} />
                <FormField id="phone" label="Téléphone" value={phone} onChange={setPhone} />
                <FormField id="address" label="Adresse" value={address} onChange={setAddress} />
                <button type="submit" className="self-end border rounded px-3 py-1">
                    Ajouter
                </button>
            </form>

            <StatusMessage
                loading={loading}
                error={error}
                isEmpty={!loading && !error && fournisseurs.length === 0}
                emptyMessage="Aucun fournisseur"
            />

            {!loading && !error && fournisseurs.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={fournisseurs}
                    getRowId={(f) => f.id}
                    renderActions={(f) =>
                        editingId === f.id ? (
                            <>
                                <button onClick={() => saveEdit(f.id)}>Enregistrer</button>
                                <button onClick={() => setEditingId(null)}>Annuler</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => startEdit(f)}>Modifier</button>
                                <button onClick={() => removeFournisseur(f.id)}>Supprimer</button>
                            </>
                        )
                    }
                />
            )}
        </div>
    );
}
