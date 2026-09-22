import { getPurchaseOrder } from '../api/purchaseOrders'
import type { PurchaseOrderRead } from '../types/api'
import { useFetch } from './useFetch'

export function usePurchaseOrder(id: number) {
  const { data: order, loading, error } = useFetch<PurchaseOrderRead | null>(() => getPurchaseOrder(id), null, id)
  return { order, loading, error }
}
