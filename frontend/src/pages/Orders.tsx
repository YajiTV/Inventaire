import { Link } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useSuppliers } from "../hooks/useSuppliers";
import { orderStatusLabel } from "../lib/purchaseOrders";

export default function Orders() {
    const { orders, loading: ordersLoading, error: ordersError } = usePurchaseOrders();
    const { suppliers, loading: suppliersLoading, error: suppliersError } = useSuppliers();

    const loading = ordersLoading || suppliersLoading;
    const error = ordersError ?? suppliersError;

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
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </p>
            )}

            {!loading && error === null && orders.length === 0 && (
                <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">Aucune commande.</p>
            )}

            {!loading && error === null && orders.length > 0 && (
                <div className="overflow-x-auto rounded border dark:border-gray-700">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50 text-left dark:bg-gray-800">
                            <tr>
                                <th className="px-3 py-2 font-medium">Référence</th>
                                <th className="px-3 py-2 font-medium">Fournisseur</th>
                                <th className="px-3 py-2 font-medium">Statut</th>
                                <th className="px-3 py-2 font-medium text-right">Total</th>
                                <th className="px-3 py-2 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-t dark:border-gray-700">
                                    <td className="px-3 py-2 font-medium">{order.reference}</td>
                                    <td className="px-3 py-2">{suppliers.find(s => s.id === order.supplier_id)?.name ?? "Inconnu"}</td>
                                    <td className="px-3 py-2">{orderStatusLabel(order.status)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{order.total_price} €</td>
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
