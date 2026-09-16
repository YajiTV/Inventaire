import {http, HttpResponse } from 'msw';
import type { components } from '../../../types/api';

type CategoryRead = components['schemas']['CategoryRead']
type CategoryCreate = components['schemas']['CategoryCreate']
type CategoryUpdate = components['schemas']['CategoryUpdate']

let categories: CategoryRead[] = [
     {id: 1, name: 'Alimentaire', description: 'Produits Frais'},
     {id: 2, name: 'Alimentaire', description: 'Produits sec'},
]
let nextId = 3

export const categoryHandlers = [
  http.get('*/categories', () => HttpResponse.json(categories)),

  http.post('*/categories', async ({ request }) => {
    const payload = (await request.json()) as CategoryCreate
    const created: CategoryRead = { id: nextId++, description: null, ...payload }
    categories.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('*/categories/:id', ({ params }) => {
    const category = categories.find((c) => c.id === Number(params.id))
    if (!category) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(category)
  }),

  http.patch('*/categories/:id', async ({ params, request }) => {
    const category = categories.find((c) => c.id === Number(params.id))
    if (!category) return new HttpResponse(null, { status: 404 })
    const patch = (await request.json()) as CategoryUpdate
    Object.assign(category, patch)
    return HttpResponse.json(category)
  }),

  http.delete('*/categories/:id', ({ params }) => {
    const exists = categories.some((c) => c.id === Number(params.id))
    if (!exists) return new HttpResponse(null, { status: 404 })
    categories = categories.filter((c) => c.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),
]
