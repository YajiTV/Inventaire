import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MovementsTable } from '../components/MovementsTable'
import { useStockMovements } from '../hooks/useStockMovements'
import { useProducts } from '../hooks/useProducts'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'

export default function Movements() {
  const [filters, setFilters] = useState(EMPTY_MOVEMENT_FILTERS)
  const { movements, loading: movementsLoading, error: movementsError } = useStockMovements(filters)
  const { products, loading: productsLoading, error: productsError } = useProducts()

  const loading = movementsLoading || productsLoading
  const error = movementsError ?? productsError

  return (
    <section className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Mouvements de stock</h1>
        <div className="flex gap-4 text-sm">
          <Link to="/movements/new" className="underline">
            Saisir un mouvement
          </Link>
          <Link to="/stocks" className="underline">
            Voir les stocks
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="filter-product" className="mb-1 block text-sm">
            Produit
          </label>
          <select
            id="filter-product"
            value={filters.productId}
            onChange={(event) => setFilters({ ...filters, productId: event.target.value })}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Tous</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="filter-location" className="mb-1 block text-sm">
            Emplacement
          </label>
          <input
            id="filter-location"
            value={filters.locationId}
            onChange={(event) => setFilters({ ...filters, locationId: event.target.value })}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="filter-type" className="mb-1 block text-sm">
            Type de mouvement
          </label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Tous</option>
            <option value="in">Entrée</option>
            <option value="out">Sortie</option>
            <option value="transfer">Transfert</option>
          </select>
        </div>
      </div>

      {loading && <p>Chargement des mouvements...</p>}
      {!loading && error !== null && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      {!loading && error === null && <MovementsTable movements={movements} products={products} />}
    </section>
  )
}
