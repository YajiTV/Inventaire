import { useAuth } from '../hooks/useAuth'
import { useReplenishment } from '../hooks/useReplenishment'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useStockMovements } from '../hooks/useStockMovements'
import { useStocks } from '../hooks/useStocks'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'
import { DashboardCard } from '../components/DashboardCard'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const { suggestions, loading: replenishmentLoading, error: replenishmentError } = useReplenishment()
  const { orders, loading: ordersLoading, error: ordersError } = usePurchaseOrders()
  const { movements, loading: movementsLoading, error: movementsError } = useStockMovements(EMPTY_MOVEMENT_FILTERS)
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks()

  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-8">
        <p>Bienvenue sur l'inventaire, veuillez vous identifier</p>
      </div>
    )
  }

  const ordersEnCours = orders.filter((order) => order.status === 'draft' || order.status === 'sent').length

  return (
    <div className="p-4 sm:p-8">
      <p className="mb-4">Bienvenue {user?.full_name}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardCard
          to="/replenishment"
          label="Produits sous le seuil"
          value={suggestions.length}
          loading={replenishmentLoading}
          error={replenishmentError}
        />
        <DashboardCard to="/orders" label="Commandes à traiter" value={ordersEnCours} loading={ordersLoading} error={ordersError} />
        <DashboardCard
          to="/movements"
          label="Mouvements enregistrés"
          value={movements.length}
          loading={movementsLoading}
          error={movementsError}
        />
        <DashboardCard to="/stocks" label="Lignes de stock" value={stocks.length} loading={stocksLoading} error={stocksError} />
      </div>
    </div>
  )
}
