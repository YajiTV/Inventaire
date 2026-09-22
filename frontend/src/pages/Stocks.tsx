import { useMemo, useState } from 'react'
import { StockTable } from '../components/StockTable'
import { useStocks } from '../hooks/useStocks'
import { useLocations } from '../hooks/useLocations'
import { useProducts } from '../hooks/useProducts'
import { EMPTY_STOCK_FILTERS, buildStockRows, filterStockRows, summarize } from '../lib/stocks'

export default function Stocks() {
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks()
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  const [filters, setFilters] = useState(EMPTY_STOCK_FILTERS)

  const loading = stocksLoading || productsLoading || locationsLoading
  const error = stocksError ?? productsError ?? locationsError

  const rows = useMemo(() => buildStockRows(stocks, products, locations), [stocks, products, locations])
  const visibleRows = useMemo(() => filterStockRows(rows, filters), [rows, filters])
  const summary = summarize(visibleRows)

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Stocks</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded border p-3 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Références</div>
          <div className="text-xl font-semibold tabular-nums">{summary.references}</div>
        </div>
        <div className="rounded border p-3 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Quantité totale</div>
          <div className="text-xl font-semibold tabular-nums">{summary.quantity}</div>
        </div>
        <div className="rounded border p-3 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Sous le seuil</div>
          <div className="text-xl font-semibold tabular-nums text-red-700 dark:text-red-400">{summary.alerts}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="stock-search" className="mb-1 block text-sm">
            Rechercher
          </label>
          <input
            id="stock-search"
            type="search"
            placeholder="Steak haché"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="stock-location" className="mb-1 block text-sm">
            Emplacement
          </label>
          <select
            id="stock-location"
            value={filters.locationId}
            onChange={(event) => setFilters({ ...filters, locationId: event.target.value })}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Tous</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.code})
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={filters.onlyBelowThreshold}
            onChange={(event) => setFilters({ ...filters, onlyBelowThreshold: event.target.checked })}
          />
          Sous le seuil uniquement
        </label>
      </div>

      {loading && <p>Chargement des stocks...</p>}
      {!loading && error !== null && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      {!loading && error === null && <StockTable rows={visibleRows} />}
    </section>
  )
}
