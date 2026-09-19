import { lineTotal } from "../lib/purchaseOrders";
import type { OrderLineRead } from "../types/api";

type OrderLinesTableProps = {
    lines: OrderLineRead[];
};

export function OrderLinesTable({ lines }: OrderLinesTableProps) {
    if (lines.length === 0) {
        return (
            <p className="rounded border border-dashed p-6 text-center text-gray-600">
                Aucune ligne sur cette commande.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded border">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-3 py-2 font-medium">Produit</th>
                        <th className="px-3 py-2 font-medium text-right">Quantité</th>
                        <th className="px-3 py-2 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(line => (
                        <tr key={line.id} className="border-t">
                            <td className="px-3 py-2">{line.product_id}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{lineTotal(line).toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
