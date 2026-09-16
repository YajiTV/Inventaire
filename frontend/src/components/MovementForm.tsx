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
        <form onSubmit={handleSubmit}>
            <label htmlFor="type">Type de mouvement</label>
            <select id="type" value={type} onChange={event => setType(event.target.value as MovementType)}>
                <option value="in">Entrée</option>
                <option value="out">Sortie</option>
                <option value="transfer">Transfert</option>
            </select>

            <label htmlFor="product">Produit</label>
            <input id="product" value={productId} onChange={event => setProductId(event.target.value)} />

            <label htmlFor="quantity">Quantité</label>
            <input id="quantity" value={quantity} onChange={event => setQuantity(event.target.value)} />

            {type !== "in" && (
                <>
                    <label htmlFor="source">Emplacement d'origine</label>
                    <input id="source" value={sourceId} onChange={event => setSourceId(event.target.value)} />
                </>
            )}

            {type !== "out" && (
                <>
                    <label htmlFor="target">Emplacement de destination</label>
                    <input id="target" value={targetId} onChange={event => setTargetId(event.target.value)} />
                </>
            )}

            {errors.map(error => (
                <p key={error} role="alert">
                    {error}
                </p>
            ))}

            <button type="submit">Enregistrer</button>
        </form>
    );
}
