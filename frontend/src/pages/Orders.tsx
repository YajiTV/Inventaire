import { Link } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { orderStatusLabel } from "../lib/purchaseOrders";

export default function Orders() {
    const { orders, loading, error } = usePurchaseOrders();

    return (
        <section className="p-4 sm:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold">Commandes</h1>
                <div className="flex gap-4 text-sm">
                    <Link to="/replenishment" className="underline">
                        Réapprovisionnement
                    </Link>
                </div>
            </div>

            {loading && <p>Chargement des commandes...</p>}
            {!loading && error !== null && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}

            {!loading && error === null && orders.length === 0 && (
                <p className="rounded border border-dashed p-6 text-center text-gray-600">Aucune commande.</p>
            )}

            {!loading && error === null && orders.length > 0 && (
                <div className="overflow-x-auto rounded border">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2 font-medium">Référence</th>
                                <th className="px-3 py-2 font-medium">Statut</th>
                                <th className="px-3 py-2 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-3 py-2 font-medium">{order.reference}</td>
                                    <td className="px-3 py-2">{orderStatusLabel(order.status)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <Link to={`/orders/${order.id}`} className="underline">
                                            Détail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
