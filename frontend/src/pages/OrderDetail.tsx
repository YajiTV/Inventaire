import { Link, useParams } from "react-router-dom";
import { OrderLinesTable } from "../components/OrderLinesTable";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { useAllProducts } from "../hooks/useProducts";
import { useSuppliers } from "../hooks/useSuppliers";
import { useLocations } from "../hooks/useLocations";
import { orderStatusLabel } from "../lib/purchaseOrders";

export default function OrderDetail() {
    const { id } = useParams();
    const { order, loading: orderLoading, error: orderError } = usePurchaseOrder(Number(id));
    const { products, loading: productsLoading, error: productsError } = useAllProducts();
    const { suppliers, loading: suppliersLoading, error: suppliersError } = useSuppliers();
    const { locations, loading: locationsLoading, error: locationsError } = useLocations();

    const loading = orderLoading || productsLoading || suppliersLoading || locationsLoading;
    const error = orderError ?? productsError ?? suppliersError ?? locationsError;
    const supplier = suppliers.find(s => s.id === order?.supplier_id);
    const location = locations.find(l => l.id === order?.location_id);

    return (
        <section className="p-4 sm:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold">
                    {order !== null ? `Commande ${order.reference}` : "Commande"}
                </h1>
                <div className="flex gap-4 text-sm">
                    <Link to="/orders" className="underline">
                        Retour aux commandes
                    </Link>
                </div>
            </div>

            {loading && <p>Chargement de la commande...</p>}

            {!loading && error !== null && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </p>
            )}

            {!loading && error === null && order === null && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    Commande introuvable
                </p>
            )}

            {!loading && error === null && order !== null && (
                <>
                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded border p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Fournisseur</div>
                            <div className="text-xl font-semibold">{supplier?.name ?? "Inconnu"}</div>
                        </div>
                        <div className="rounded border p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Livraison</div>
                            <div className="text-xl font-semibold">{location?.name ?? "Inconnu"}</div>
                        </div>
                        <div className="rounded border p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Statut</div>
                            <div className="text-xl font-semibold">{orderStatusLabel(order.status)}</div>
                        </div>
                        <div className="rounded border p-3 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                            <div className="text-xl font-semibold tabular-nums">{order.total_price} €</div>
                        </div>
                    </div>

                    <OrderLinesTable lines={order.lines} products={products} />
                </>
            )}
        </section>
    );
}
