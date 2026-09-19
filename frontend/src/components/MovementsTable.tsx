import { movementLabel, sortMovements } from "../lib/stockMovements";
import type { StockMovementRead } from "../types/api";

type MovementsTableProps = {
    movements: StockMovementRead[];
};

export function MovementsTable({ movements }: MovementsTableProps) {
    if (movements.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600">
                Aucun mouvement ne correspond.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded border">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Produit</th>
                        <th className="px-3 py-2 font-medium text-right">Quantité</th>
                    </tr>
                </thead>
                <tbody>
                    {sortMovements(movements).map(movement => (
                        <tr key={movement.id} className="border-t">
                            <td className="px-3 py-2">{movementLabel(movement.type)}</td>
                            <td className="px-3 py-2">{movement.product_id}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{movement.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
