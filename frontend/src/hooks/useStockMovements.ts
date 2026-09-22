import { useEffect, useState } from 'react'
import { fetchMovements, type MovementFilters } from '../api/stockMovements'
import type { StockMovementRead } from '../types/api'

export function useStockMovements(filters: MovementFilters) {
  const [movements, setMovements] = useState<StockMovementRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Depend on primitives, not on the filters object: a new reference each render would refetch in a loop
  const { productId, locationId, type } = filters

  useEffect(() => {
    let cancelled = false

    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    fetchMovements({ productId, locationId, type })
      .then((data) => {
        if (cancelled) return
        setMovements(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId, locationId, type])

  return { movements, loading, error }
}
