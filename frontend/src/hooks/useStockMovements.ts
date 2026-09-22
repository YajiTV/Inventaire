import { fetchMovements, type MovementFilters } from '../api/stockMovements'
import type { StockMovementRead } from '../types/api'
import { useFetch } from './useFetch'

export function useStockMovements(filters: MovementFilters) {
  const { data: movements, loading, error } = useFetch<StockMovementRead[]>(
    () => fetchMovements(filters),
    [],
    JSON.stringify(filters),
  )
  return { movements, loading, error }
}
