import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BUTTON_VARIANTS } from '../lib/ui'
import { CheckboxField } from '../components/CheckboxField'
import { FormField } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { SelectField } from '../components/SelectField'
import { StatusMessage } from '../components/StatusMessage'
import { StockTable } from '../components/StockTable'
import { TotalsStrip } from '../components/TotalsStrip'
import { useStocks } from '../hooks/useStocks'
import { useLocations } from '../hooks/useLocations'
import { useAllProducts } from '../hooks/useProducts'
import { EMPTY_STOCK_FILTERS, buildStockRows, filterStockRows, summarize } from '../lib/stocks'

export default function Stocks() {
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks()
  const { products, loading: productsLoading, error: productsError } = useAllProducts()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  const [filters, setFilters] = useState(EMPTY_STOCK_FILTERS)

  const loading = stocksLoading || productsLoading || locationsLoading
  const error = stocksError ?? productsError ?? locationsError

  const rows = useMemo(() => buildStockRows(stocks, products, locations), [stocks, products, locations])
  const visibleRows = useMemo(() => filterStockRows(rows, filters), [rows, filters])
  const summary = summarize(visibleRows)

  return (
    <>
      <PageHeader
        title="Stocks"
        actions={
          <Link to="/movements/new" className={BUTTON_VARIANTS.primary}>
            Saisir un mouvement
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        <TotalsStrip
          totals={[
            { label: 'Références', value: summary.references, loading },
            { label: 'Quantité totale', value: summary.quantity, loading },
            { label: 'Lignes sous le seuil', value: summary.alerts, loading, shortage: true },
          ]}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
          <FormField
            id="stock-search"
            label="Rechercher"
            type="search"
            placeholder="Steak haché"
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
          />
          <SelectField
            id="stock-location"
            label="Emplacement"
            value={filters.locationId}
            onChange={(value) => setFilters({ ...filters, locationId: value })}
            options={locations.map((location) => ({ value: location.id, label: `${location.name} (${location.code})` }))}
            placeholder="Tous"
          />
          <CheckboxField
            id="stock-below"
            label="Sous le seuil uniquement"
            checked={filters.onlyBelowThreshold}
            onChange={(checked) => setFilters({ ...filters, onlyBelowThreshold: checked })}
          />
        </div>

        <StatusMessage loading={loading} error={error} />
        {!loading && error === null && <StockTable rows={visibleRows} />}
      </div>
    </>
  )
}
