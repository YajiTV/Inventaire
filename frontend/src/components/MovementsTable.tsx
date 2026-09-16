import { movementLabel, sortMovements } from "../lib/stockMovements";
import type { StockMovementRead } from "../types/api";

type MovementsTableProps = {
    movements: StockMovementRead[];
};

export function MovementsTable({ movements }: MovementsTableProps) {
    if (movements.length === 0) {
        return <p>Aucun mouvement</p>;
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                </tr>
            </thead>
            <tbody>
                {sortMovements(movements).map(movement => (
                    <tr key={movement.id}>
                        <td>{movementLabel(movement.type)}</td>
                        <td>{movement.product_id}</td>
                        <td>{movement.quantity}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
