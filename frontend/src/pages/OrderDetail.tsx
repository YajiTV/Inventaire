import { useParams } from "react-router-dom";
import { OrderLinesTable } from "../components/OrderLinesTable";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { orderStatusLabel } from "../lib/purchaseOrders";

export default function OrderDetail() {
    const { id } = useParams();
    const { order, loading, error } = usePurchaseOrder(Number(id));

    if (loading) return <p>Chargement...</p>;

    if (error) return <p className="text-red-600">{error}</p>;

    if (order === null) return <p className="text-red-600">Commande introuvable</p>;

    return (
        <div className="p-8">
            <h1>Commande {order.reference}</h1>
            <p>Statut : {orderStatusLabel(order.status)}</p>
            <p>Total : {order.total_price}</p>
            <OrderLinesTable lines={order.lines} />
        </div>
    );
}
