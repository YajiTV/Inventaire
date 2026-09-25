import { Link, useParams } from 'react-router-dom'
import { FactGrid } from '../components/FactGrid'
import { OrderLinesTable } from '../components/OrderLinesTable'
import { OrderStatusStamp } from '../components/OrderStatusStamp'
import { PageHeader } from '../components/PageHeader'
import { StatusMessage } from '../components/StatusMessage'
import { usePurchaseOrder } from '../hooks/usePurchaseOrder'
import { useAllProducts } from '../hooks/useProducts'
import { useSuppliers } from '../hooks/useSuppliers'
import { useLocations } from '../hooks/useLocations'
import { formatMoney } from '../lib/format'

export default function OrderDetail() {
  const { id } = useParams()
  const { order, loading: orderLoading, error: orderError } = usePurchaseOrder(Number(id))
  const { products, loading: productsLoading, error: productsError } = useAllProducts()
  const { suppliers, loading: suppliersLoading, error: suppliersError } = useSuppliers()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()

  const loading = orderLoading || productsLoading || suppliersLoading || locationsLoading
  const error = orderError ?? productsError ?? suppliersError ?? locationsError
  const supplier = suppliers.find((s) => s.id === order?.supplier_id)
  const location = locations.find((l) => l.id === order?.location_id)

  return (
    <>
      <PageHeader
        title="Bon de commande"
        serial={order?.reference}
        back={
          <Link to="/orders" className="font-semibold hover:underline">
            Retour aux commandes
          </Link>
        }
      />

      <StatusMessage loading={loading} error={error ?? (!loading && order === null ? 'Commande introuvable' : null)} />

      {!loading && error === null && order !== null && (
        <div className="flex flex-col gap-6">
          <FactGrid
            facts={[
              { label: 'Fournisseur', value: supplier?.name ?? 'Inconnu' },
              { label: 'Livraison', value: location?.name ?? 'Inconnu' },
              { label: 'Statut', value: <OrderStatusStamp status={order.status} /> },
              { label: 'Total', value: <span className="text-2xl font-extrabold">{formatMoney(order.total_price)}</span> },
            ]}
          />
          <OrderLinesTable lines={order.lines} products={products} total={order.total_price} />
        </div>
      )}
    </>
  )
}
