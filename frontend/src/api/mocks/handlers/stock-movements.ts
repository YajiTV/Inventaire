import {http, HttpResponse} from 'msw';
import type { StockMovementRead, StockMovementCreate } from '../../../types/api';

let stockMovements: StockMovementRead[] = [
    {
        id: 1,
        product_id: 1,
        type: 'in',
        quantity: 25,
        source_location_id: null,
        target_location_id: 1,
        reason: 'Reception initiale',
        user_id: 1,
        created_at: new Date().toISOString()
    }
]

let nextId = 2

export const stockMovementHandlers = [
    // Pas de PATCH/DELETE : un mouvement de stock est un evenement, pas une ressource modifiable
    http.get('*/stock-movements', ({request}) => {
        const url = new URL(request.url)
        const productId = url.searchParams.get('product_id')
        const locationId = url.searchParams.get('location_id')
        const type = url.searchParams.get('type')
        const limit = Number(url.searchParams.get('limit') ?? 50)

        let result = stockMovements

        if (productId)
            result = result.filter((m) => m.product_id === Number(productId))

        if (locationId) {
            const id = Number(locationId)
            result = result.filter((m) => m.source_location_id === id || m.target_location_id === id)
        }

        if (type)
            result = result.filter((m) => m.type === type)

        return HttpResponse.json(result.slice(0, limit))
    }),

    http.post('*/stock-movements', async ({request}) => {
        const payload = (await request.json()) as StockMovementCreate

        const created: StockMovementRead = {
            id: nextId++,
            product_id: payload.product_id,
            type: payload.type,
            quantity: payload.quantity,
            source_location_id: payload.source_location_id ?? null,
            target_location_id: payload.target_location_id ?? null,
            reason: payload.reason ?? null,
            user_id: 1, // aligne sur MOCK_USER dans auth.ts
            created_at: new Date().toISOString()
        }
        stockMovements.push(created)
        return HttpResponse.json(created, {status: 201})
    })
]
