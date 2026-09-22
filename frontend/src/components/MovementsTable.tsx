import { movementLabel, sortMovements } from "../lib/stockMovements";
import type { StockMovementRead } from "../types/api";
import type { ProductRead } from "../types/api";

type MovementsTableProps = {
    movements: StockMovementRead[];
    products: ProductRead[];
};

export function MovementsTable({ movements, products }: MovementsTableProps) {
    if (movements.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">
                Aucun mouvement ne correspond.
            </p>
        );
    }

    // L'API /stock-movements ne renvoie que product_id : le nom vient de /products.
    const productsById = new Map(products.map(product => [product.id, product]));

    return (
        <div className="overflow-x-auto rounded border dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800">
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
                            <tr key={movement.id} className="border-t dark:border-gray-700">
                                <td className="px-3 py-2">{movementLabel(movement.type)}</td>
                                <td className="px-3 py-2">
                                    {product?.name ?? `Produit #${movement.product_id}`}
                                    {product !== undefined && product.sku !== "" && (
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{product.sku}</span>
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
