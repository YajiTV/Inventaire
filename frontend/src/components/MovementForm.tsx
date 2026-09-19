import type { FormEvent } from "react";
import { useState } from "react";
import { validateMovement } from "../lib/stockMovements";
import type { MovementType, StockMovementCreate } from "../types/api";

type MovementFormProps = {
    onSubmit: (movement: StockMovementCreate) => void;
};

export function MovementForm({ onSubmit }: MovementFormProps) {
    const [type, setType] = useState<MovementType>("in");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [sourceId, setSourceId] = useState("");
    const [targetId, setTargetId] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const movement: StockMovementCreate = {
            product_id: Number(productId),
            type,
            quantity: Number(quantity),
            source_location_id: sourceId === "" ? null : Number(sourceId),
            target_location_id: targetId === "" ? null : Number(targetId),
            reason: null,
        };

        const found = validateMovement(movement);
        setErrors(found);

        if (found.length === 0) {
            onSubmit(movement);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl">
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor="type" className="mb-1 block text-sm">
                        Type de mouvement
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={event => setType(event.target.value as MovementType)}
                        className="w-full rounded border px-2 py-1"
                    >
                        <option value="in">Entrée</option>
                        <option value="out">Sortie</option>
                        <option value="transfer">Transfert</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="product" className="mb-1 block text-sm">
                        Produit
                    </label>
                    <input
                        id="product"
                        value={productId}
                        onChange={event => setProductId(event.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>

                <div>
                    <label htmlFor="quantity" className="mb-1 block text-sm">
                        Quantité
                    </label>
                    <input
                        id="quantity"
                        value={quantity}
                        onChange={event => setQuantity(event.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>

                {type !== "in" && (
                    <div>
                        <label htmlFor="source" className="mb-1 block text-sm">
                            Emplacement d'origine
                        </label>
                        <input
                            id="source"
                            value={sourceId}
                            onChange={event => setSourceId(event.target.value)}
                            className="w-full rounded border px-2 py-1"
                        />
                    </div>
                )}

                {type !== "out" && (
                    <div>
                        <label htmlFor="target" className="mb-1 block text-sm">
                            Emplacement de destination
                        </label>
                        <input
                            id="target"
                            value={targetId}
                            onChange={event => setTargetId(event.target.value)}
                            className="w-full rounded border px-2 py-1"
                        />
                    </div>
                )}
            </div>

            {errors.length > 0 && (
                <ul className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
                    {errors.map(error => (
                        <li key={error} role="alert">
                            {error}
                        </li>
                    ))}
                </ul>
            )}

            <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700">
                Enregistrer
            </button>
        </form>
    );
}
