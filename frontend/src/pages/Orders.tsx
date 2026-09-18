import { Link } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { orderStatusLabel } from "../lib/purchaseOrders";

export default function Orders() {
    const { orders, loading, error } = usePurchaseOrders();

    return (
        <div className="p-8">
            <h1>Commandes</h1>
            {loading && <p>Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="py-1 pr-6 text-left">Référence</th>
                        <th className="py-1 pr-6 text-left">Statut</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="py-1 pr-6 text-left">{order.reference}</td>
                            <td className="py-1 pr-6 text-left">{orderStatusLabel(order.status)}</td>
                            <td className="py-1 pr-6 text-left">
                                <Link to={`/orders/${order.id}`}>Détail</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
