import type { StockRead } from "../types/api";

type StockTableProps = {
    stocks: StockRead[];
};

export function StockTable({ stocks }: StockTableProps) {
    if (stocks.length === 0) {
        return <p>Aucun stock</p>;
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Emplacement</th>
                    <th>Quantité</th>
                </tr>
            </thead>
            <tbody>
                {stocks.map(stock => (
                    <tr key={stock.id}>
                        <td>{stock.product_id}</td>
                        <td>{stock.location_id}</td>
                        <td>{stock.quantity}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
