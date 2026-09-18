import { useEffect, useState } from 'react'
import { fetchLocations } from '../api/locations'
import type { LocationRead } from '../types/api'

export function useLocations() {
  const [locations, setLocations] = useState<LocationRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchLocations()
      .then((data) => {
        if (cancelled) return
        setLocations(data)
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

  return { locations, loading, error }
}
