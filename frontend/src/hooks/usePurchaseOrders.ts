import { getPurchaseOrders } from '../api/purchaseOrders'
import type { PurchaseOrderRead } from '../types/api'
import { useFetch } from './useFetch'

export function usePurchaseOrders() {
  const { data: orders, loading, error } = useFetch<PurchaseOrderRead[]>(getPurchaseOrders, [])
  return { orders, loading, error }
}
