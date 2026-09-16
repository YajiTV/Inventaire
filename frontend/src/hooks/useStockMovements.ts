import { useEffect, useState } from 'react'
import { fetchMovements, type MovementFilters } from '../api/stockMovements'
import type { StockMovementRead } from '../types/api'

export function useStockMovements(filters: MovementFilters) {
  const [movements, setMovements] = useState<StockMovementRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { productId, locationId, type } = filters

  useEffect(() => {
    let cancelled = false

    // Un changement de filtre relance une requete : on repasse en chargement.
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
    // Depend des trois valeurs et non de l'objet : une nouvelle reference a chaque
    // rendu relancerait la requete en boucle.
  }, [productId, locationId, type])

  return { movements, loading, error }
}
