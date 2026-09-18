import { useEffect, useState } from 'react'
import { fetchReplenishmentSuggestions, createReplenishmentOrder } from '../api/replenishment'
import type { PurchaseOrderRead, ReplenishmentRequest, ReplenishmentSuggestion } from '../types/api'

export function useReplenishment() {
  const [suggestions, setSuggestions] = useState<ReplenishmentSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchReplenishmentSuggestions()
      .then((data) => {
        if (cancelled) return
        setSuggestions(data)
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
  }, [])

  async function triggerOrder(data: ReplenishmentRequest): Promise<PurchaseOrderRead> {
    return createReplenishmentOrder(data)
  }

  return { suggestions, loading, error, triggerOrder }
}