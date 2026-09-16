import { http, HttpResponse } from 'msw'
import type { components } from '../../../types/api'

type PurchaseOrderRead = components['schemas']['PurchaseOrderRead']
type PurchaseOrderCreate = components['schemas']['PurchaseOrderCreate']
type PurchaseOrderUpdate = components['schemas']['PurchaseOrderUpdate']
type OrderLineRead = components['schemas']['OrderLineRead']
type OrderLineCreate = components['schemas']['OrderLineCreate']
type OrderLineUpdate = components['schemas']['OrderLineUpdate']

let purchaseOrders: PurchaseOrderRead[] = [
  {
    id: 1,
    reference: 'PO-2026-001',
    supplier_id: 1,
    location_id: 1,
    status: 'draft',
    total_price: '25.00',
    ordered_at: '2026-09-10T09:00:00Z',
    received_at: null,
    lines: [{ id: 1, order_id: 1, product_id: 1, quantity: 10, unit_price: '2.50' }],
  },
]

let nextOrderId = 2
let nextLineId = 2

// Calculee a la creation a partir des lignes fournies, comme le ferait le backend.
// Pas recalculee ensuite sur l'ajout/patch/suppression d'une ligne (cf. total_quantity sur products).
function computeTotalPrice(lines: OrderLineRead[]): string {
  const total = lines.reduce((sum, line) => sum + line.quantity * Number(line.unit_price), 0)
  return total.toFixed(2)
}

export const purchaseOrderHandlers = [
  http.get('*/purchase-orders', ({ request }) => {
    const url = new URL(request.url)
    const supplierId = url.searchParams.get('supplier_id')
    const orderStatus = url.searchParams.get('order_status')
    let result = purchaseOrders
    if (supplierId) result = result.filter((o) => o.supplier_id === Number(supplierId))
    if (orderStatus) result = result.filter((o) => o.status === orderStatus)
    return HttpResponse.json(result)
  }),

  http.post('*/purchase-orders', async ({ request }) => {
    const payload = (await request.json()) as PurchaseOrderCreate
    const lines: OrderLineRead[] = payload.lines.map((line) => ({
      id: nextLineId++,
      order_id: nextOrderId,
      ...line,
      unit_price: String(line.unit_price),
    }))
    const created: PurchaseOrderRead = {
      id: nextOrderId++,
      reference: payload.reference,
      supplier_id: payload.supplier_id,
      location_id: payload.location_id,
      status: 'draft',
      total_price: computeTotalPrice(lines),
      ordered_at: new Date().toISOString(),
      received_at: null,
      lines,
    }
    purchaseOrders.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('*/purchase-orders/:id', ({ params }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(order)
  }),

  http.patch('*/purchase-orders/:id', async ({ params, request }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    const patch = (await request.json()) as PurchaseOrderUpdate
    Object.assign(order, patch)
    return HttpResponse.json(order)
  }),

  http.delete('*/purchase-orders/:id', ({ params }) => {
    const exists = purchaseOrders.some((o) => o.id === Number(params.id))
    if (!exists) return new HttpResponse(null, { status: 404 })
    purchaseOrders = purchaseOrders.filter((o) => o.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/purchase-orders/:id/lines', ({ params }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(order.lines)
  }),

  http.post('*/purchase-orders/:id/lines', async ({ params, request }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    const payload = (await request.json()) as OrderLineCreate
    const created: OrderLineRead = {
      id: nextLineId++,
      order_id: order.id,
      ...payload,
      unit_price: String(payload.unit_price),
    }
    order.lines.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch('*/purchase-orders/:id/lines/:lineId', async ({ params, request }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    const line = order.lines.find((l) => l.id === Number(params.lineId))
    if (!line) return new HttpResponse(null, { status: 404 })
    const patch = (await request.json()) as OrderLineUpdate
    Object.assign(line, {
      ...patch,
      ...(patch.unit_price !== undefined && patch.unit_price !== null
        ? { unit_price: String(patch.unit_price) }
        : {}),
    })
    return HttpResponse.json(line)
  }),

  http.delete('*/purchase-orders/:id/lines/:lineId', ({ params }) => {
    const order = purchaseOrders.find((o) => o.id === Number(params.id))
    if (!order) return new HttpResponse(null, { status: 404 })
    const exists = order.lines.some((l) => l.id === Number(params.lineId))
    if (!exists) return new HttpResponse(null, { status: 404 })
    order.lines = order.lines.filter((l) => l.id !== Number(params.lineId))
    return new HttpResponse(null, { status: 204 })
  }),
]
