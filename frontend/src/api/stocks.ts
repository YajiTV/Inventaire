import { apiFetch } from '../lib/api'
import type { StockRead } from '../types/api'

export async function fetchStocks(): Promise<StockRead[]> {
  const response = await apiFetch('/stocks')
  return response.json()
}
