import type { MovementType, StockMovementCreate, StockMovementRead, StockRead } from "../types/api";

export function validateMovement(movement: StockMovementCreate): string[] {
    const errors: string[] = [];

    if (movement.quantity <= 0) {
        errors.push("La quantité doit être supérieure à 0.");
    }

    if (movement.type === "in" && movement.target_location_id == null) {
        errors.push("Une entrée demande un emplacement de destination.");
    }

    if (movement.type === "out" && movement.source_location_id == null) {
        errors.push("Une sortie demande un emplacement d'origine.");
    }

    if (movement.type === "transfer") {
        if (movement.source_location_id == null || movement.target_location_id == null) {
            errors.push("Un transfert demande une origine et une destination.");
        } else if (movement.source_location_id === movement.target_location_id) {
            errors.push("Les deux emplacements doivent être différents.");
        }
    }

    return errors;
}

function adjustStock(stocks: StockRead[], productId: number, locationId: number, delta: number): StockRead[] {
    const existing = stocks.find(stock => stock.product_id === productId && stock.location_id === locationId);

    if (existing) {
        return stocks.map(stock => (stock === existing ? { ...stock, quantity: stock.quantity + delta } : stock));
    }

    if (delta <= 0) {
        return [...stocks];
    }

    const nextId = stocks.reduce((max, stock) => Math.max(max, stock.id), 0) + 1;
    return [...stocks, { id: nextId, product_id: productId, location_id: locationId, quantity: delta }];
}

export function applyMovement(stocks: StockRead[], movement: StockMovementCreate): StockRead[] {
    if (movement.type === "in") {
        return adjustStock(stocks, movement.product_id, movement.target_location_id!, movement.quantity);
    }

    if (movement.type === "out") {
        return adjustStock(stocks, movement.product_id, movement.source_location_id!, -movement.quantity);
    }

    const afterRemoval = applyMovement(stocks, { ...movement, type: "out" });
    return applyMovement(afterRemoval, { ...movement, type: "in" });
}

export function sortMovements(movements: StockMovementRead[]): StockMovementRead[] {
    return [...movements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

const MOVEMENT_LABELS: Record<MovementType, string> = {
    in: "Entrée",
    out: "Sortie",
    transfer: "Transfert",
};

export function movementLabel(type: MovementType): string {
    return MOVEMENT_LABELS[type];
}
