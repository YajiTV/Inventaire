import { lineTotal } from "../lib/purchaseOrders";
import type { OrderLineRead, ProductRead } from "../types/api";

type OrderLinesTableProps = {
    lines: OrderLineRead[];
    products: ProductRead[];
};

export function OrderLinesTable({ lines, products }: OrderLinesTableProps) {
    if (lines.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">
                Aucune ligne sur cette commande.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded border dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800">
                    <tr>
                        <th className="px-3 py-2 font-medium">Produit</th>
                        <th className="px-3 py-2 font-medium text-right">Quantité</th>
                        <th className="px-3 py-2 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(line => (
                        <tr key={line.id} className="border-t dark:border-gray-700">
                            <td className="px-3 py-2">
                                {products.find(product => product.id === line.product_id)?.name ?? "Produit supprimé"}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{lineTotal(line).toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
