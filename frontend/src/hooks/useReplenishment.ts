import { fetchReplenishmentSuggestions, createReplenishmentOrder } from '../api/replenishment'
import type { ReplenishmentSuggestion } from '../types/api'
import { useFetch } from './useFetch'

export function useReplenishment() {
  const { data: suggestions, loading, error } = useFetch<ReplenishmentSuggestion[]>(fetchReplenishmentSuggestions, [])
  return { suggestions, loading, error, triggerOrder: createReplenishmentOrder }
}
