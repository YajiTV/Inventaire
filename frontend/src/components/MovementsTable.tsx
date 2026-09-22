import { movementLabel, sortMovements } from "../lib/stockMovements";
import type { LocationRead, ProductRead, StockMovementRead } from "../types/api";

type MovementsTableProps = {
    movements: StockMovementRead[];
    products: ProductRead[];
    locations: LocationRead[];
};

export function MovementsTable({ movements, products, locations }: MovementsTableProps) {
    if (movements.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">
                Aucun mouvement ne correspond.
            </p>
        );
    }

    const productsById = new Map(products.map(product => [product.id, product]));
    const locationName = (id: number | null) => locations.find(location => location.id === id)?.name ?? "";

    return (
        <div className="overflow-x-auto rounded border dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800">
                    <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Produit</th>
                        <th className="px-3 py-2 font-medium">Emplacement</th>
                        <th className="px-3 py-2 font-medium text-right">Quantité</th>
                    </tr>
                </thead>
                <tbody>
                    {sortMovements(movements).map(movement => {
                        const product = productsById.get(movement.product_id);
                        const places = [movement.source_location_id, movement.target_location_id]
                            .filter(id => id !== null)
                            .map(locationName);
                        return (
                            <tr key={movement.id} className="border-t dark:border-gray-700">
                                <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {new Date(movement.created_at).toLocaleDateString("fr-FR")}
                                </td>
                                <td className="px-3 py-2">{movementLabel(movement.type)}</td>
                                <td className="px-3 py-2">
                                    {product?.name ?? "Produit supprimé"}
                                    {product !== undefined && product.sku !== "" && (
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{product.sku}</span>
                                    )}
                                </td>
                                <td className="px-3 py-2">{places.join(" → ")}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{movement.quantity}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
