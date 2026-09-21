import { movementLabel, sortMovements } from "../lib/stockMovements";
import type { StockMovementRead } from "../types/api";
import type { Produit } from "../types/product";

type MovementsTableProps = {
    movements: StockMovementRead[];
    products: Produit[];
};

export function MovementsTable({ movements, products }: MovementsTableProps) {
    if (movements.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600">
                Aucun mouvement ne correspond.
            </p>
        );
    }

    // L'API /stock-movements ne renvoie que product_id : le nom vient de /products.
    const productsById = new Map(products.map(product => [product.id, product]));

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
                    {sortMovements(movements).map(movement => {
                        const product = productsById.get(movement.product_id);
                        return (
                            <tr key={movement.id} className="border-t">
                                <td className="px-3 py-2">{movementLabel(movement.type)}</td>
                                <td className="px-3 py-2">
                                    {product?.name ?? `Produit #${movement.product_id}`}
                                    {product !== undefined && product.sku !== "" && (
                                        <span className="ml-2 text-xs text-gray-500">{product.sku}</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums">{movement.quantity}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
