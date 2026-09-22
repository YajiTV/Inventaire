import { useEffect, useState } from 'react'
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '../api/locations'
import type { LocationCreate, LocationRead, LocationUpdate } from '../types/api'

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

  async function addLocation(data: LocationCreate) {
    const created = await createLocation(data)
    setLocations((prev) => [...prev, created])
  }

  async function editLocation(id: number, data: LocationUpdate) {
    const updated = await updateLocation(id, data)
    setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)))
  }

  async function removeLocation(id: number) {
    await deleteLocation(id)
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  return { locations, loading, error, addLocation, editLocation, removeLocation }
}
