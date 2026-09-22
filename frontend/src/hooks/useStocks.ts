import { fetchStocks } from '../api/stocks'
import type { StockRead } from '../types/api'
import { useFetch } from './useFetch'

export function useStocks() {
  const { data: stocks, loading, error } = useFetch<StockRead[]>(fetchStocks, [])
  return { stocks, loading, error }
}
