import { describe, expect, it } from 'vitest'
import { buildStockRows, filterStockRows, summarize } from './stocks'
import type { LocationRead, StockRead } from '../types/api'
import type { ProductRead } from '../types/api'

const products = [
  {
    id: 1,
    sku: 'PAIN-001',
    name: 'Pain burger',
    description: null,
    unit_price: '1.20',
    category_id: 1,
    supplier_id: 1,
    barcode: null,
    reorder_threshold: 50,
    total_quantity: 40,
  },
  {
    id: 2,
    sku: 'FRIT-001',
    name: 'Frites',
    description: null,
    unit_price: '2.00',
    category_id: 2,
    supplier_id: 3,
    barcode: null,
    reorder_threshold: 10,
    total_quantity: 80,
  },
] satisfies ProductRead[]

const locations: LocationRead[] = [
  { id: 1, code: 'CONG-01', name: 'Congélateur' },
  { id: 2, code: 'RES-01', name: 'Réserve sèche' },
]

const stocks: StockRead[] = [
  { id: 10, product_id: 1, location_id: 1, quantity: 40 },
  { id: 11, product_id: 2, location_id: 2, quantity: 80 },
  { id: 12, product_id: 99, location_id: 42, quantity: 5 },
]

describe('buildStockRows', () => {
  it('resout les noms et marque les produits sous le seuil', () => {
    const rows = buildStockRows(stocks, products, locations)

    expect(rows[0].productName).toBe('Pain burger')
    expect(rows[0].locationName).toBe('Congélateur')
    expect(rows[0].belowThreshold).toBe(true)
    expect(rows[1].belowThreshold).toBe(false)
  })

  it('reste lisible quand le produit ou l emplacement est inconnu', () => {
    const rows = buildStockRows(stocks, products, locations)

    expect(rows[2].productName).toBe('Produit supprimé')
    expect(rows[2].locationName).toBe('Emplacement supprimé')
    expect(rows[2].belowThreshold).toBe(false)
  })
})

describe('filterStockRows', () => {
  const rows = buildStockRows(stocks, products, locations)

  it('filtre par nom ou sku, sans tenir compte de la casse', () => {
    expect(filterStockRows(rows, { search: 'frit', locationId: '', onlyBelowThreshold: false })).toHaveLength(1)
    expect(filterStockRows(rows, { search: 'PAIN-001', locationId: '', onlyBelowThreshold: false })).toHaveLength(1)
  })

  it('filtre par emplacement et par seuil', () => {
    expect(filterStockRows(rows, { search: '', locationId: '2', onlyBelowThreshold: false })).toHaveLength(1)
    expect(filterStockRows(rows, { search: '', locationId: '', onlyBelowThreshold: true })).toHaveLength(1)
  })
})

describe('summarize', () => {
  it('additionne les quantites visibles et compte les alertes', () => {
    expect(summarize(buildStockRows(stocks, products, locations))).toEqual({
      references: 3,
      quantity: 125,
      alerts: 1,
    })
  })
})
