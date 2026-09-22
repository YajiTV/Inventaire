import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReplenishment } from '../hooks/useReplenishment'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useStockMovements } from '../hooks/useStockMovements'
import { useStocks } from '../hooks/useStocks'
import { useAllProducts } from '../hooks/useProducts'
import { useLocations } from '../hooks/useLocations'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'
import { sortMovements } from '../lib/stockMovements'
import { orderStatusLabel } from '../lib/purchaseOrders'
import { DashboardCard } from '../components/DashboardCard'
import { MovementsTable } from '../components/MovementsTable'
import { StatusMessage } from '../components/StatusMessage'

const PREVIEW_SIZE = 5

const QUICK_ACTIONS = [
  { to: '/movements/new', label: 'Saisir un mouvement' },
  { to: '/replenishment', label: 'Réapprovisionner' },
  { to: '/products', label: 'Ajouter un produit' },
  { to: '/orders', label: 'Voir les commandes' },
]

const FEATURES = [
  { title: 'Stocks en temps réel', text: 'Quantités par produit et par emplacement.' },
  { title: 'Mouvements tracés', text: 'Entrées, sorties et transferts historisés.' },
  { title: 'Réapprovisionnement', text: 'Alertes sous le seuil et commandes fournisseur.' },
]

const CARD = 'min-w-0 rounded-xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800'
const BUTTON = 'rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'

export default function Home() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <Welcome />
}

function Welcome() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <section className="py-8 text-center sm:py-16">
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Gérez votre inventaire sans effort</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Produits, stocks, fournisseurs et commandes au même endroit.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" className="rounded bg-gray-900 px-4 py-2 text-white dark:bg-white dark:text-gray-900">
            Se connecter
          </Link>
          <Link to="/register" className="rounded border px-4 py-2 dark:border-gray-600">
            Créer un compte
          </Link>
        </div>
      </section>

      <ul className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className={CARD}>
            <h2 className="mb-1 font-semibold">{feature.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { suggestions, loading: replenishmentLoading, error: replenishmentError } = useReplenishment()
  const { orders, loading: ordersLoading, error: ordersError } = usePurchaseOrders()
  const { movements, loading: movementsLoading, error: movementsError } = useStockMovements(EMPTY_MOVEMENT_FILTERS)
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks()
  const { products, loading: productsLoading, error: productsError } = useAllProducts()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()

  const pendingOrders = orders.filter((order) => order.status === 'draft' || order.status === 'sent')
  const recentMovements = sortMovements(movements).slice(0, PREVIEW_SIZE)
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-6">
        <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{today}</p>
        <h1 className="text-2xl font-semibold">Bonjour {user?.full_name}</h1>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardCard
          to="/replenishment"
          label="Produits sous le seuil"
          value={suggestions.length}
          loading={replenishmentLoading}
          error={replenishmentError}
          alert
        />
        <DashboardCard to="/orders" label="Commandes à traiter" value={pendingOrders.length} loading={ordersLoading} error={ordersError} />
        <DashboardCard to="/movements" label="Mouvements enregistrés" value={movements.length} loading={movementsLoading} error={movementsError} />
        <DashboardCard to="/stocks" label="Lignes de stock" value={stocks.length} loading={stocksLoading} error={stocksError} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to} className={BUTTON}>
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="À réapprovisionner" to="/replenishment">
          <StatusMessage
            loading={replenishmentLoading}
            error={replenishmentError}
            isEmpty={suggestions.length === 0}
            emptyMessage="Tous les stocks sont au-dessus du seuil."
          />
          {!replenishmentLoading && !replenishmentError && (
            <ul className="divide-y dark:divide-gray-700">
              {suggestions.slice(0, PREVIEW_SIZE).map((s) => (
                <li key={s.product_id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/products/${s.product_id}`} className="underline">
                    {s.product_name}
                  </Link>
                  <span className="tabular-nums text-red-600 dark:text-red-400">
                    {s.current_quantity} / {s.reorder_threshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Commandes en cours" to="/orders">
          <StatusMessage
            loading={ordersLoading}
            error={ordersError}
            isEmpty={pendingOrders.length === 0}
            emptyMessage="Aucune commande en cours."
          />
          {!ordersLoading && !ordersError && (
            <ul className="divide-y dark:divide-gray-700">
              {pendingOrders.slice(0, PREVIEW_SIZE).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/orders/${order.id}`} className="underline">
                    {order.reference}
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400">
                    {orderStatusLabel(order.status)} · {order.total_price} €
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="min-w-0 lg:col-span-2">
          <Panel title="Derniers mouvements" to="/movements">
            <StatusMessage
              loading={movementsLoading || productsLoading || locationsLoading}
              error={movementsError ?? productsError ?? locationsError}
            />
            {!movementsLoading && !productsLoading && !locationsLoading && !movementsError && !productsError && !locationsError && (
              <MovementsTable movements={recentMovements} products={products} locations={locations} />
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

interface PanelProps {
  title: string
  to: string
  children: React.ReactNode
}

function Panel({ title, to, children }: PanelProps) {
  return (
    <section className={CARD}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link to={to} className="text-sm underline">
          Tout voir
        </Link>
      </div>
      {children}
    </section>
  )
}
