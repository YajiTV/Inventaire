import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReplenishment } from '../hooks/useReplenishment'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useStockMovements } from '../hooks/useStockMovements'
import { useStocks } from '../hooks/useStocks'
import { useAllProducts } from '../hooks/useProducts'
import { useLocations } from '../hooks/useLocations'
import { useSuppliers } from '../hooks/useSuppliers'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'
import { sortMovements } from '../lib/stockMovements'
import { BUTTON_VARIANTS } from '../lib/ui'
import { MovementsTable } from '../components/MovementsTable'
import { MovementTag } from '../components/MovementTag'
import { OrderStatusStamp } from '../components/OrderStatusStamp'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { StatusMessage } from '../components/StatusMessage'
import { TotalsStrip } from '../components/TotalsStrip'

const PREVIEW_SIZE = 5

// What each copy of the pad stands for, shown on the public page
const COLOUR_LAW = [
  { swatch: 'bg-paper', name: 'Blanc', meaning: 'Stock', text: 'Quantités par produit et par emplacement.' },
  { swatch: 'bg-canary', name: 'Jaune', meaning: 'Entrée', text: 'Livraisons reçues, ajoutées au stock.' },
  { swatch: 'bg-rose', name: 'Rose', meaning: 'Sortie et manque', text: 'Consommations, et produits sous le seuil.' },
  { swatch: 'bg-sky', name: 'Bleu', meaning: 'Transfert', text: "Passage d'un emplacement à un autre." },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <Welcome />
}

function Welcome() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:py-20">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div>
          <h1 className="text-5xl leading-[0.95] font-extrabold uppercase tracking-tight text-balance font-stretch-condensed sm:text-6xl lg:text-7xl">
            Le stock du restaurant, bon par bon
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Chaque entrée, sortie et transfert laisse une trace. Sous le seuil, la commande fournisseur est prête.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className={BUTTON_VARIANTS.primary}>
              Se connecter
            </Link>
            <Link to="/register" className={BUTTON_VARIANTS.secondary}>
              Créer un compte
            </Link>
          </div>
        </div>

        <SamplePad />
      </section>

      <section className="mt-20">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider font-stretch-condensed text-print">
          Une couleur, un sens
        </h2>
        <ul className="border-t border-rule-strong">
          {COLOUR_LAW.map((copy) => (
            <li key={copy.name} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-4 border-b border-rule py-4 sm:grid-cols-[2.5rem_12rem_minmax(0,1fr)]">
              <span className={`h-8 w-10 border border-rule-strong ${copy.swatch}`} />
              <span className="font-extrabold uppercase tracking-tight font-stretch-condensed">
                {copy.name} <span className="text-print">/ {copy.meaning}</span>
              </span>
              <span className="col-start-2 text-ink-soft sm:col-start-3">{copy.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// Illustrative movement slip in triplicate (demo content, not live data)
function SamplePad() {
  return (
    <figure aria-label="Exemple de bon de mouvement" className="relative mx-auto w-full max-w-sm pt-6 pr-6">
      <div className="absolute inset-0 translate-x-0 translate-y-0 rotate-2 border border-rule-strong bg-rose" aria-hidden="true" />
      <div className="absolute inset-0 top-3 right-3 -rotate-1 border border-rule-strong bg-canary" aria-hidden="true" />
      <div className="relative border border-rule-strong bg-paper shadow-[0_12px_30px_-12px_rgb(29_37_102/0.35)]">
        <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
          <span className="text-sm font-extrabold uppercase tracking-tight font-stretch-condensed">Bon de mouvement</span>
          <span className="font-bold tabular-nums font-stretch-condensed text-stamp">N° 000142</span>
        </div>
        <div className="perforation" />
        <dl className="grid grid-cols-2 border-t border-rule-strong text-sm">
          <div className="border-r border-b border-rule-strong px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">Type</dt>
            <dd className="mt-1">
              <MovementTag type="transfer" />
            </dd>
          </div>
          <div className="border-b border-rule-strong px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">Quantité</dt>
            <dd className="mt-1 text-2xl leading-none font-extrabold">30</dd>
          </div>
          <div className="col-span-2 border-b border-rule-strong px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">Produit</dt>
            <dd className="mt-1 font-semibold">Steak haché 45g</dd>
          </div>
          <div className="col-span-2 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">Trajet</dt>
            <dd className="mt-1">Congélateur, vers Cuisine</dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-3 text-right text-xs text-ink-soft">Exemple</figcaption>
    </figure>
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
  const { suppliers } = useSuppliers()

  const pendingOrders = orders.filter((order) => order.status === 'draft' || order.status === 'sent')
  const recentMovements = sortMovements(movements).slice(0, PREVIEW_SIZE)
  const now = new Date()
  const today = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const serial = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const firstName = user?.full_name.split(' ')[0]

  const tableLoading = movementsLoading || productsLoading || locationsLoading
  const tableError = movementsError ?? productsError ?? locationsError

  return (
    <>
      <PageHeader
        title="Feuille du jour"
        serial={serial}
        subtitle={`Bonjour ${firstName}, nous sommes ${today}.`}
        actions={
          <>
            <Link to="/replenishment" className={BUTTON_VARIANTS.secondary}>
              Réapprovisionner
            </Link>
            <Link to="/movements/new" className={BUTTON_VARIANTS.primary}>
              Saisir un mouvement
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <TotalsStrip
          totals={[
            {
              label: 'Produits sous le seuil',
              value: suggestions.length,
              to: '/replenishment',
              loading: replenishmentLoading,
              error: replenishmentError,
              shortage: true,
            },
            { label: 'Commandes à traiter', value: pendingOrders.length, to: '/orders', loading: ordersLoading, error: ordersError },
            { label: 'Mouvements enregistrés', value: movements.length, to: '/movements', loading: movementsLoading, error: movementsError },
            { label: 'Lignes de stock', value: stocks.length, to: '/stocks', loading: stocksLoading, error: stocksError },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Section
            title="À réapprovisionner"
            shortage={suggestions.length > 0}
            action={<AllLink to="/replenishment" />}
          >
            <StatusMessage
              loading={replenishmentLoading}
              error={replenishmentError}
              isEmpty={suggestions.length === 0}
              emptyMessage="Tous les stocks sont au-dessus du seuil."
            />
            {!replenishmentLoading && !replenishmentError && suggestions.length > 0 && (
              <ul className="-my-1">
                {suggestions.slice(0, PREVIEW_SIZE).map((s) => (
                  <li key={s.product_id} className="flex items-center justify-between gap-3 border-b border-rule py-2.5 last:border-b-0">
                    <Link to={`/products/${s.product_id}`} className="font-semibold hover:underline">
                      {s.product_name}
                    </Link>
                    <span className="text-sm whitespace-nowrap text-ink-soft">
                      <span className="text-base font-bold text-ink">{s.current_quantity}</span> sur {s.reorder_threshold}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Commandes en cours" action={<AllLink to="/orders" />}>
            <StatusMessage
              loading={ordersLoading}
              error={ordersError}
              isEmpty={pendingOrders.length === 0}
              emptyMessage="Aucune commande en cours."
            />
            {!ordersLoading && !ordersError && pendingOrders.length > 0 && (
              <ul className="-my-1">
                {pendingOrders.slice(0, PREVIEW_SIZE).map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-2.5 last:border-b-0">
                    <span className="min-w-0">
                      <Link to={`/orders/${order.id}`} className="font-bold text-stamp hover:underline">
                        {order.reference}
                      </Link>
                      <span className="ml-2 text-sm text-ink-soft">
                        {suppliers.find((s) => s.id === order.supplier_id)?.name}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <OrderStatusStamp status={order.status} />
                      <span className="font-semibold tabular-nums">{order.total_price} €</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title="Derniers mouvements" action={<AllLink to="/movements" />} flush>
          {tableLoading || tableError ? (
            <div className="p-3">
              <StatusMessage loading={tableLoading} error={tableError} />
            </div>
          ) : (
            <MovementsTable movements={recentMovements} products={products} locations={locations} framed={false} />
          )}
        </Section>
      </div>
    </>
  )
}

function AllLink({ to }: { to: string }) {
  return (
    <Link to={to} className="text-sm font-semibold hover:underline">
      Tout voir
    </Link>
  )
}
