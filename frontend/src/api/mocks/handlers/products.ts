import { http, HttpResponse } from 'msw'
import type { components } from '../../../types/api'

type ProductRead = components['schemas']['ProductRead']
type ProductCreate = components['schemas']['ProductCreate']
type ProductUpdate = components['schemas']['ProductUpdate']
type ProductLookup = components['schemas']['ProductLookup']

let products: ProductRead[] = [
  {
    id: 1,
    sku: 'PAIN-REG-001',
    name: 'Pain Reg',
    description: 'Les meilleurs pains',
    unit_price: '2.50',
    category_id: 1,
    supplier_id: null,
    barcode: '3017620422003',
    reorder_threshold: 5,
    total_quantity: 25,
  },
]

let nextId = 2

// ProductLookup simule l'API tierce Open Food Facts : seul ce code-barres est connu.
const knownLookups: Record<string, ProductLookup> = {
  '3017620422003': {
    barcode: '3017620422003',
    name: 'Nutella',
    description: 'Pâte à tartiner aux noisettes et au cacao',
    image_url: null,
  },
}

export const productHandlers = [
  http.get('*/products', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? 20)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    return HttpResponse.json({
      items: products.slice(offset, offset + limit),
      total: products.length,
      limit,
      offset,
    })
  }),

  http.post('*/products', async ({ request }) => {
    const payload = (await request.json()) as ProductCreate
    const created: ProductRead = {
      id: nextId++,
      description: null,
      supplier_id: null,
      barcode: null,
      total_quantity: 0,
      ...payload,
      unit_price: String(payload.unit_price),
    }
    products.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('*/products/lookup/:barcode', ({ params }) => {
    const lookup = knownLookups[String(params.barcode)]
    if (!lookup) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(lookup)
  }),

  http.get('*/products/:id', ({ params }) => {
    const product = products.find((p) => p.id === Number(params.id))
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  http.patch('*/products/:id', async ({ params, request }) => {
    const product = products.find((p) => p.id === Number(params.id))
    if (!product) return new HttpResponse(null, { status: 404 })
    const patch = (await request.json()) as ProductUpdate
    Object.assign(product, {
      ...patch,
      ...(patch.unit_price !== undefined && patch.unit_price !== null
        ? { unit_price: String(patch.unit_price) }
        : {}),
    })
    return HttpResponse.json(product)
  }),

  http.delete('*/products/:id', ({ params }) => {
    const exists = products.some((p) => p.id === Number(params.id))
    if (!exists) return new HttpResponse(null, { status: 404 })
    products = products.filter((p) => p.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),
]
