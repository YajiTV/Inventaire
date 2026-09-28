import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BUTTON_VARIANTS } from '../lib/ui'
import { MovementsTable } from '../components/MovementsTable'
import { PageHeader } from '../components/PageHeader'
import { SelectField } from '../components/SelectField'
import { StatusMessage } from '../components/StatusMessage'
import { useStockMovements } from '../hooks/useStockMovements'
import { useAllProducts } from '../hooks/useProducts'
import { useLocations } from '../hooks/useLocations'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'

const TYPE_OPTIONS = [
  { value: 'in', label: 'Entrée' },
  { value: 'out', label: 'Sortie' },
  { value: 'transfer', label: 'Transfert' },
]

export default function Movements() {
  const [filters, setFilters] = useState(EMPTY_MOVEMENT_FILTERS)
  const { movements, loading: movementsLoading, error: movementsError } = useStockMovements(filters)
  const { products, loading: productsLoading, error: productsError } = useAllProducts()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  // Set by NewMovement after a successful save
  const freshId = (useLocation().state as { freshId?: number } | null)?.freshId

  const loading = movementsLoading || productsLoading || locationsLoading
  const error = movementsError ?? productsError ?? locationsError

  return (
    <>
      <PageHeader
        title="Mouvements de stock"
        actions={
          <>
            <Link to="/stocks" className={BUTTON_VARIANTS.secondary}>
              Voir les stocks
            </Link>
            <Link to="/movements/new" className={BUTTON_VARIANTS.primary}>
              Saisir un mouvement
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            id="filter-product"
            label="Produit"
            value={filters.productId}
            onChange={(value) => setFilters({ ...filters, productId: value })}
            options={products.map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` }))}
            placeholder="Tous"
          />
          <SelectField
            id="filter-location"
            label="Emplacement"
            value={filters.locationId}
            onChange={(value) => setFilters({ ...filters, locationId: value })}
            options={locations.map((location) => ({ value: location.id, label: `${location.name} (${location.code})` }))}
            placeholder="Tous"
          />
          <SelectField
            id="filter-type"
            label="Type de mouvement"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            options={TYPE_OPTIONS}
            placeholder="Tous"
          />
        </div>

        <StatusMessage loading={loading} error={error} />
        {!loading && error === null && (
          <MovementsTable movements={movements} products={products} locations={locations} freshId={freshId} />
        )}
      </div>
    </>
  )
}
