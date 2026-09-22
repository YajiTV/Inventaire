import { useEffect, useState } from 'react'
import { fetchStocks } from '../api/stocks'
import type { StockRead } from '../types/api'

export function useStocks() {
  const [stocks, setStocks] = useState<StockRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchStocks()
      .then((data) => {
        if (cancelled) return
        setStocks(data)
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

  return { stocks, loading, error }
}
