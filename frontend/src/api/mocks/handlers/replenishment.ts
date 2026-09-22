import { http, HttpResponse } from "msw";
import type { ReplenishmentRequest, ReplenishmentSuggestion } from "../../../types/api";
import { buildSuggestions, seedProducts } from "../seed";
import { createPurchaseOrder } from "./purchase-orders";

const suggestions: ReplenishmentSuggestion[] = buildSuggestions(seedProducts);

function unitPriceOf(productId: number): string {
    return seedProducts.find(product => product.id === productId)?.unit_price ?? "0.00";
}

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

        const lines = suggestions
            .filter(s => payload.product_ids.includes(s.product_id))
            .map(s => ({ product_id: s.product_id, quantity: s.suggested_quantity, unit_price: unitPriceOf(s.product_id) }));

        const created = createPurchaseOrder({
            reference: "",
            supplier_id: payload.supplier_id,
            location_id: payload.location_id,
            lines,
        });

        return HttpResponse.json(created, { status: 201 });
    }),
];
