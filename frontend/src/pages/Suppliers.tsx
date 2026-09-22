import { useState } from "react";
import { useSuppliers } from "../hooks/useSuppliers";
import type { SupplierRead } from "../types/api";
import { ApiError } from "../lib/api";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+$/;

export default function Suppliers() {
    const { suppliers, loading, error, addSupplier, editSupplier, removeSupplier } =
        useSuppliers();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    function validate(): boolean {
        const newErrors: typeof errors = {};

        if (!name.trim()) newErrors.name = "Le nom est obligatoire.";
        if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
            newErrors.email = "Format d'email invalide (ex: contact@fournisseur.fr).";
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
            await addSupplier({
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
            });
            setName("");
            setEmail("");
            setPhone("");
            setAddress("");
            setErrors({});
            setSuccessMessage("Fournisseur ajouté avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    function startEdit(f: SupplierRead) {
        setEditingId(f.id);
        setEditName(f.name);
    }

    async function saveEdit(id: number) {
        setApiError(null);
        setSuccessMessage(null);

        if (!editName.trim()) {
            setApiError("Le nom est obligatoire");
            return;
        }

        try {
            await editSupplier(id, { name: editName });
            setEditingId(null);
            setSuccessMessage("Fournisseur modifié avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    async function handleDelete(id: number) {
        setApiError(null);
        setSuccessMessage(null);
        try {
            await removeSupplier(id);
            setSuccessMessage("Fournisseur supprimé avec succès");
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Erreur inattendue");
        }
    }

    const columns: DataTableColumn<SupplierRead>[] = [
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
        <div className="p-4 sm:p-8">
            <h1 className="mb-6 text-2xl font-semibold">Fournisseurs</h1>

            <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
                <FormField id="name" label="Nom" value={name} onChange={setName} error={errors.name} required />
                <FormField
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    placeholder="contact@fournisseur.fr"
                />
                <FormField id="phone" label="Téléphone" value={phone} onChange={setPhone} placeholder="0102030405" />
                <FormField id="address" label="Adresse" value={address} onChange={setAddress} />
                <button type="submit" className="self-end border rounded px-3 py-1 dark:border-gray-600">
                    Ajouter
                </button>
            </form>

            <StatusMessage
                loading={loading}
                error={error}
                isEmpty={!loading && !error && suppliers.length === 0}
                emptyMessage="Aucun fournisseur"
            />
            {apiError && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    {apiError}
                </p>
            )}
            {successMessage && <p className="text-green-600 dark:text-green-400">{successMessage}</p>}

            {!loading && !error && suppliers.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={suppliers}
                    getRowId={(f) => f.id}
                    renderActions={(f) =>
                        editingId === f.id ? (
                            <>
                                <button onClick={() => saveEdit(f.id)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Enregistrer</button>
                                <button onClick={() => setEditingId(null)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => startEdit(f)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Modifier</button>
                                <button onClick={() => handleDelete(f.id)} className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Supprimer</button>
                            </>
                        )
                    }
                />
            )}
        </div>
    );
}
