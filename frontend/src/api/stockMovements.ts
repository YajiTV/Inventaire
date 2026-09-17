import { apiFetch } from '../lib/api'
import type { StockMovementCreate, StockMovementRead } from '../types/api'

export type MovementFilters = {
  productId: string
  locationId: string
  type: string
}

export const EMPTY_MOVEMENT_FILTERS: MovementFilters = {
  productId: '',
  locationId: '',
  type: '',
}

export async function fetchMovements(
  filters: MovementFilters = EMPTY_MOVEMENT_FILTERS,
): Promise<StockMovementRead[]> {
  const params = new URLSearchParams()
  if (filters.productId !== '') params.set('product_id', filters.productId)
  if (filters.locationId !== '') params.set('location_id', filters.locationId)
  if (filters.type !== '') params.set('type', filters.type)

  const query = params.toString()
  const response = await apiFetch(query === '' ? '/stock-movements' : `/stock-movements?${query}`)
  return response.json()
}

export async function createMovement(
  movement: StockMovementCreate,
): Promise<StockMovementRead> {
  const response = await apiFetch('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(movement),
  })
  return response.json()
}
