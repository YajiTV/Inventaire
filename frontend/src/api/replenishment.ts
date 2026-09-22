import {apiFetch} from "../lib/api.ts";
import type {PurchaseOrderRead, ReplenishmentRequest, ReplenishmentSuggestion} from "../types/api.ts";

export async function fetchReplenishmentSuggestions(): Promise<ReplenishmentSuggestion[]> {
  const response = await apiFetch('/replenishment/suggestions')
  return response.json()
}

export async function createReplenishmentOrder(data: ReplenishmentRequest): Promise<PurchaseOrderRead> {
  const response = await apiFetch('/replenishment/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}