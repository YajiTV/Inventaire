import { useState } from "react";
import { useSuppliers } from "../hooks/useSuppliers";
import type { SupplierRead } from "../types/api";
import { useActionFeedback } from "../hooks/useActionFeedback";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { ActionFeedback } from "../components/ActionFeedback";
import { ErrorList } from "../components/ErrorList";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { Workbench } from "../components/Workbench";

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
    const [editErrors, setEditErrors] = useState<string[]>([]);
    const feedback = useActionFeedback();

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
        feedback.clear();

        if (!validate()) return;

        const added = await feedback.run(
            () =>
                addSupplier({
                    name: name.trim(),
                    email: email.trim() || null,
                    phone: phone.trim() || null,
                    address: address.trim() || null,
                }),
            "Fournisseur ajouté avec succès.",
        );
        if (added) {
            setName("");
            setEmail("");
            setPhone("");
            setAddress("");
        }
    }

    function startEdit(f: SupplierRead) {
        setEditingId(f.id);
        setEditName(f.name);
        setEditErrors([]);
    }

    async function saveEdit(id: number) {
        if (!editName.trim()) {
            setEditErrors(["Le nom est obligatoire."]);
            return;
        }
        setEditErrors([]);

        const saved = await feedback.run(() => editSupplier(id, { name: editName.trim() }), "Fournisseur modifié avec succès.");
        if (saved) setEditingId(null);
    }

    async function handleDelete(f: SupplierRead) {
        if (!window.confirm(`Supprimer le fournisseur "${f.name}" ?`)) return;
        await feedback.run(() => removeSupplier(f.id), "Fournisseur supprimé avec succès.");
    }

    const columns: DataTableColumn<SupplierRead>[] = [
        {
            header: "Nom",
            render: (f) =>
                editingId === f.id ? (
                    <FormField id={`edit-name-${f.id}`} label="Nom" value={editName} onChange={setEditName} compact />
                ) : (
                    <span className="font-semibold">{f.name}</span>
                ),
        },
        { header: "Email", render: (f) => f.email },
        { header: "Téléphone", render: (f) => <span className="whitespace-nowrap">{f.phone}</span> },
        { header: "Adresse", render: (f) => <span className="text-ink-soft">{f.address}</span> },
    ];

    return (
        <>
            <PageHeader title="Fournisseurs" />

            <Workbench
                formTitle="Nouveau fournisseur"
                form={
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                        <FormField id="name" label="Nom" value={name} onChange={setName} error={errors.name} placeholder="Boulangerie Martin" required />
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
                        <FormField id="address" label="Adresse" value={address} onChange={setAddress} placeholder="12 rue des Halles, Toulouse" />
                        <Button type="submit" variant="primary">
                            Ajouter le fournisseur
                        </Button>
                    </form>
                }
            >
                <ActionFeedback error={feedback.error} success={feedback.success} />
                <ErrorList errors={editErrors} />
                <StatusMessage
                    loading={loading}
                    error={error}
                    isEmpty={!loading && !error && suppliers.length === 0}
                    emptyMessage="Aucun fournisseur. Ajoutez le premier avec le formulaire."
                />

                {!loading && !error && suppliers.length > 0 && (
                    <DataTable
                        columns={columns}
                        rows={suppliers}
                        getRowId={(f) => f.id}
                        renderActions={(f) =>
                            editingId === f.id ? (
                                <>
                                    <Button onClick={() => saveEdit(f.id)} variant="primary">
                                        Enregistrer
                                    </Button>
                                    <Button onClick={() => setEditingId(null)}>Annuler</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => startEdit(f)}>Modifier</Button>
                                    <Button onClick={() => handleDelete(f)} variant="danger">
                                        Supprimer
                                    </Button>
                                </>
                            )
                        }
                    />
                )}
            </Workbench>
        </>
    );
}
