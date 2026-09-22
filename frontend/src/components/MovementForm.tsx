import type { FormEvent } from "react";
import { useState } from "react";
import { validateMovement } from "../lib/stockMovements";
import type { LocationRead, MovementType, ProductRead, StockMovementCreate } from "../types/api";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";

type MovementFormProps = {
    products: ProductRead[];
    locations: LocationRead[];
    onSubmit: (movement: StockMovementCreate) => Promise<void>;
};

const TYPE_OPTIONS = [
    { value: "in", label: "Entrée" },
    { value: "out", label: "Sortie" },
    { value: "transfer", label: "Transfert" },
];

export function MovementForm({ products, locations, onSubmit }: MovementFormProps) {
    const [type, setType] = useState<MovementType>("in");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [sourceId, setSourceId] = useState("");
    const [targetId, setTargetId] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }));
    const locationOptions = locations.map(l => ({ value: l.id, label: `${l.name} (${l.code})` }));

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const movement: StockMovementCreate = {
            product_id: Number(productId),
            type,
            quantity: Number(quantity),
            source_location_id: type === "in" || sourceId === "" ? null : Number(sourceId),
            target_location_id: type === "out" || targetId === "" ? null : Number(targetId),
            reason: null,
        };

        const found = validateMovement(movement);
        setErrors(found);
        if (found.length > 0) return;

        setSubmitting(true);
        await onSubmit(movement);
        setSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="max-w-xl">
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField
                    id="type"
                    label="Type de mouvement"
                    value={type}
                    onChange={value => setType(value as MovementType)}
                    options={TYPE_OPTIONS}
                />
                <SelectField
                    id="product"
                    label="Produit"
                    value={productId}
                    onChange={setProductId}
                    options={productOptions}
                    placeholder="Choisir..."
                />
                <FormField id="quantity" label="Quantité" type="number" value={quantity} onChange={setQuantity} placeholder="30" />

                {type !== "in" && (
                    <SelectField
                        id="source"
                        label="Emplacement d'origine"
                        value={sourceId}
                        onChange={setSourceId}
                        options={locationOptions}
                        placeholder="Choisir..."
                    />
                )}

                {type !== "out" && (
                    <SelectField
                        id="target"
                        label="Emplacement de destination"
                        value={targetId}
                        onChange={setTargetId}
                        options={locationOptions}
                        placeholder="Choisir..."
                    />
                )}
            </div>

            {errors.length > 0 && (
                <ul className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {errors.map(error => (
                        <li key={error} role="alert">
                            {error}
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
                {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
        </form>
    );
}
