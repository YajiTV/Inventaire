import { http, HttpResponse } from "msw";
import type {
    OrderLineRead,
    PurchaseOrderRead,
    ReplenishmentRequest,
    ReplenishmentSuggestion,
} from "../../../types/api";
import { buildSuggestions, seedProducts } from "../seed";

let suggestions: ReplenishmentSuggestion[] = buildSuggestions(seedProducts);

function unitPriceOf(productId: number): string {
    return seedProducts.find(product => product.id === productId)?.unit_price ?? "0.00";
}

let nextOrderId = 1;
let nextLineId = 1;

export const replenishmentHandlers = [
    http.get("*/replenishment/suggestions", ({ request }) => {
        const url = new URL(request.url);
        const supplierId = url.searchParams.get("supplier_id");

        let result = suggestions;
        if (supplierId) result = result.filter(s => s.supplier_id === Number(supplierId));

        return HttpResponse.json(result);
    }),

    http.post("*/replenishment/orders", async ({ request }) => {
        const payload = (await request.json()) as ReplenishmentRequest;

        const orderId = nextOrderId++;
        const lines: OrderLineRead[] = [];
        let total = 0;

        for (const productId of payload.product_ids) {
            const suggestion = suggestions.find(s => s.product_id === productId);
            if (!suggestion) continue;

            const unitPrice = unitPriceOf(productId);
            lines.push({
                id: nextLineId++,
                order_id: orderId,
                product_id: productId,
                quantity: suggestion.suggested_quantity,
                unit_price: unitPrice,
            });
            total += suggestion.suggested_quantity * Number(unitPrice);
        }

        const created: PurchaseOrderRead = {
            id: orderId,
            reference: `REPL-${orderId}`,
            supplier_id: payload.supplier_id,
            location_id: payload.location_id,
            status: "draft",
            total_price: total.toFixed(2),
            ordered_at: new Date().toISOString(),
            received_at: null,
            lines: lines,
        };

        return HttpResponse.json(created, { status: 201 });
    }),
];
