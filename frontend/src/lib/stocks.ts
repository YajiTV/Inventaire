import type { LocationRead, StockRead } from '../types/api'
import type { ProductRead } from '../types/api'

export interface StockRow {
  id: number
  locationId: number
  productName: string
  productSku: string
  locationName: string
  locationCode: string
  quantity: number
  totalQuantity: number
  reorderThreshold: number
  belowThreshold: boolean
}

export interface StockFilters {
  search: string
  locationId: string
  onlyBelowThreshold: boolean
}

export const EMPTY_STOCK_FILTERS: StockFilters = {
  search: '',
  locationId: '',
  onlyBelowThreshold: false,
}

export function buildStockRows(
  stocks: StockRead[],
  products: ProductRead[],
  locations: LocationRead[],
): StockRow[] {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const locationsById = new Map(locations.map((location) => [location.id, location]))

  return stocks.map((stock) => {
    const product = productsById.get(stock.product_id)
    const location = locationsById.get(stock.location_id)
    const totalQuantity = product?.total_quantity ?? stock.quantity
    const reorderThreshold = product?.reorder_threshold ?? 0

    return {
      id: stock.id,
      locationId: stock.location_id,
      productName: product?.name ?? 'Produit supprimé',
      productSku: product?.sku ?? '',
      locationName: location?.name ?? 'Emplacement supprimé',
      locationCode: location?.code ?? '',
      quantity: stock.quantity,
      totalQuantity,
      reorderThreshold,
      belowThreshold: totalQuantity <= reorderThreshold,
    }
  })
}

export function filterStockRows(rows: StockRow[], filters: StockFilters): StockRow[] {
  const search = filters.search.trim().toLowerCase()

  return rows.filter((row) => {
    if (filters.onlyBelowThreshold && !row.belowThreshold) return false
    if (filters.locationId !== '' && String(row.locationId) !== filters.locationId) return false
    if (search === '') return true
    return row.productName.toLowerCase().includes(search) || row.productSku.toLowerCase().includes(search)
  })
}

export function summarize(rows: StockRow[]): { references: number; quantity: number; alerts: number } {
  return {
    references: rows.length,
    quantity: rows.reduce((total, row) => total + row.quantity, 0),
    alerts: rows.filter((row) => row.belowThreshold).length,
  }
}
