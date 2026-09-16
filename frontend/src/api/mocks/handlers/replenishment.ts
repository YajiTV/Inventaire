import {http, HttpResponse} from 'msw';
import type { ReplenishmentSuggestion, ReplenishmentRequest, PurchaseOrderRead, OrderLineRead } from '../../../types/api';

// Liste figee, independante du stock dans products.ts : c'est juste une photo
// de ce que l'ecran Reapprovisionnement doit afficher pour le mock
let suggestions: ReplenishmentSuggestion[] = [
    {
        product_id: 1,
        product_name: 'Pain Reg',
        current_quantity: 3,
        reorder_threshold: 5,
        suggested_quantity: 20,
        supplier_id: 1
    },
    {
        product_id: 2,
        product_name: 'Croissant',
        current_quantity: 2,
        reorder_threshold: 10,
        suggested_quantity: 30,
        supplier_id: 1
    }
]

// Prix unitaire de mock associe a chaque produit, utilise quand on transforme
// une suggestion en commande (ReplenishmentSuggestion ne porte pas de prix)
const mockUnitPrices: Record<number, string> = {
    1: '2.50',
    2: '1.20'
}

let nextOrderId = 1
let nextLineId = 1

export const replenishmentHandlers = [
    http.get('*/replenishment/suggestions', ({request}) => {
        const url = new URL(request.url)
        const supplierId = url.searchParams.get('supplier_id')

        let result = suggestions
        if (supplierId)
            result = result.filter((s) => s.supplier_id === Number(supplierId))

        return HttpResponse.json(result)
    }),

    // Cree une commande fournisseur "draft" a partir des suggestions choisies.
    // Store independant de purchase-orders.ts : la commande generee ici n'apparait
    // pas dans GET /purchase-orders, c'est une limite connue du mock.
    http.post('*/replenishment/orders', async ({request}) => {
        const payload = (await request.json()) as ReplenishmentRequest

        const orderId = nextOrderId++
        const lines: OrderLineRead[] = []
        let total = 0

        for (const productId of payload.product_ids) {
            const suggestion = suggestions.find((s) => s.product_id === productId)
            if (!suggestion)
                continue

            const unitPrice = mockUnitPrices[productId] ?? '0.00'
            lines.push({
                id: nextLineId++,
                order_id: orderId,
                product_id: productId,
                quantity: suggestion.suggested_quantity,
                unit_price: unitPrice
            })
            total += suggestion.suggested_quantity * Number(unitPrice)
        }

        const created: PurchaseOrderRead = {
            id: orderId,
            reference: `REPL-${orderId}`,
            supplier_id: payload.supplier_id,
            location_id: payload.location_id,
            status: 'draft',
            total_price: total.toFixed(2),
            ordered_at: new Date().toISOString(),
            received_at: null,
            lines: lines
        }

        return HttpResponse.json(created, {status: 201})
    })
]
