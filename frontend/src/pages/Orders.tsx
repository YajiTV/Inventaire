import { Link } from 'react-router-dom'
import { BUTTON_VARIANTS } from '../lib/ui'
import { Ledger, Td, Th, Tr } from '../components/Ledger'
import { OrderStatusStamp } from '../components/OrderStatusStamp'
import { PageHeader } from '../components/PageHeader'
import { StatusMessage } from '../components/StatusMessage'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useSuppliers } from '../hooks/useSuppliers'

export default function Orders() {
  const { orders, loading: ordersLoading, error: ordersError } = usePurchaseOrders()
  const { suppliers, loading: suppliersLoading, error: suppliersError } = useSuppliers()

  const loading = ordersLoading || suppliersLoading
  const error = ordersError ?? suppliersError

  return (
    <>
      <PageHeader
        title="Commandes"
        actions={
          <Link to="/replenishment" className={BUTTON_VARIANTS.secondary}>
            Réapprovisionnement
          </Link>
        }
      />

      <StatusMessage
        loading={loading}
        error={error}
        isEmpty={!loading && error === null && orders.length === 0}
        emptyMessage="Aucune commande. Générez-en une depuis le réapprovisionnement."
      />

      {!loading && error === null && orders.length > 0 && (
        <Ledger>
          <thead>
            <tr>
              <Th>Référence</Th>
              <Th>Fournisseur</Th>
              <Th>Statut</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Link to={`/orders/${order.id}`} className="font-bold whitespace-nowrap text-stamp hover:underline">
                    {order.reference}
                  </Link>
                </Td>
                <Td>{suppliers.find((s) => s.id === order.supplier_id)?.name ?? 'Inconnu'}</Td>
                <Td>
                  <OrderStatusStamp status={order.status} />
                </Td>
                <Td align="right">
                  <span className="font-semibold whitespace-nowrap">{order.total_price} €</span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Ledger>
      )}
    </>
  )
}
