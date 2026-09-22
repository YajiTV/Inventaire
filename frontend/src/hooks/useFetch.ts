import { useEffect, useRef, useState } from 'react'

export function useFetch<T>(fetcher: () => Promise<T>, initialData: T, key: string | number = '') {
  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [loadedKey, setLoadedKey] = useState<string | number | null>(null)
  // Loading is derived: true until the request for the current key has finished
  const loading = loadedKey !== key

  // fetcher is a new function on every render: keep the latest one in a ref so that key alone decides when to refetch
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    // Ignore responses that arrive after the key changed or the component unmounted
    let cancelled = false

    fetcherRef.current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(key)
      })

    return () => {
      cancelled = true
    }
  }, [key])

  return { data, setData, loading, error }
}
