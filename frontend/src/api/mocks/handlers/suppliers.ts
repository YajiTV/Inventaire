import { http, HttpResponse } from 'msw'
import type { SupplierRead, SupplierCreate, SupplierUpdate } from '../../../types/api'

let suppliers: SupplierRead[] = [
  { id: 1, name: 'Francke', email: 'contact@francke.fr', phone: null, address: null },
]
let nextId = 2

export const supplierHandlers = [
  http.get('*/suppliers', () => HttpResponse.json(suppliers)),

  http.post('*/suppliers', async ({ request }) => {
    const payload = (await request.json()) as SupplierCreate
    const created: SupplierRead = { id: nextId++, email: null, phone: null, address: null, ...payload }
    suppliers.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('*/suppliers/:id', ({ params }) => {
    const supplier = suppliers.find((s) => s.id === Number(params.id))
    if (!supplier) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(supplier)
  }),

  http.patch('*/suppliers/:id', async ({ params, request }) => {
    const supplier = suppliers.find((s) => s.id === Number(params.id))
    if (!supplier) return new HttpResponse(null, { status: 404 })
    const patch = (await request.json()) as SupplierUpdate
    Object.assign(supplier, patch)
    return HttpResponse.json(supplier)
  }),

  http.delete('*/suppliers/:id', ({ params }) => {
    const exists = suppliers.some((s) => s.id === Number(params.id))
    if (!exists) return new HttpResponse(null, { status: 404 })
    suppliers = suppliers.filter((s) => s.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),
]
