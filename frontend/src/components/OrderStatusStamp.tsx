import { orderStatusLabel } from '../lib/purchaseOrders'
import type { OrderStatus } from '../types/api'
import { Stamp } from './Stamp'

export function OrderStatusStamp({ status }: { status: OrderStatus }) {
  return <Stamp tone={status === 'cancelled' ? 'red' : 'ink'}>{orderStatusLabel(status)}</Stamp>
}
