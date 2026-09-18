import { lineTotal } from "../lib/purchaseOrders";
import type { OrderLineRead } from "../types/api";

type OrderLinesTableProps = {
    lines: OrderLineRead[];
};

export function OrderLinesTable({ lines }: OrderLinesTableProps) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {lines.map(line => (
                    <tr key={line.id}>
                        <td>{line.product_id}</td>
                        <td>{line.quantity}</td>
                        <td>{lineTotal(line)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
