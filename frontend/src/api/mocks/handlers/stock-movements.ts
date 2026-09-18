import { http, HttpResponse } from "msw";
import { applyMovement } from "../../../lib/stockMovements";
import type { StockMovementCreate, StockMovementRead } from "../../../types/api";
import { nextIdFrom, seedMovements } from "../seed";
import { loadMock, saveMock } from "../storage";
import { getStocks, setStocks } from "./stocks";

let stockMovements: StockMovementRead[] = loadMock("stock-movements", [...seedMovements]);

let nextId = nextIdFrom(stockMovements);

export const stockMovementHandlers = [
    // Pas de PATCH/DELETE : un mouvement de stock est un evenement, pas une ressource modifiable
    http.get("*/stock-movements", ({ request }) => {
        const url = new URL(request.url);
        const productId = url.searchParams.get("product_id");
        const locationId = url.searchParams.get("location_id");
        const type = url.searchParams.get("type");
        const limit = Number(url.searchParams.get("limit") ?? 50);

        let result = stockMovements;

        if (productId) result = result.filter(m => m.product_id === Number(productId));

        if (locationId) {
            const id = Number(locationId);
            result = result.filter(m => m.source_location_id === id || m.target_location_id === id);
        }

        if (type) result = result.filter(m => m.type === type);

        return HttpResponse.json(result.slice(0, limit));
    }),

    http.post("*/stock-movements", async ({ request }) => {
        const payload = (await request.json()) as StockMovementCreate;

        // Une sortie ou un transfert ne peut pas prendre plus que ce qui est en rayon :
        // le backend repond 409 dans ce cas, le mock doit faire pareil.
        if (payload.type !== "in") {
            const line = getStocks().find(
                s => s.product_id === payload.product_id && s.location_id === payload.source_location_id,
            );
            if (!line || line.quantity < payload.quantity) {
                return HttpResponse.json({ detail: "Stock insuffisant sur l'emplacement d'origine." }, { status: 409 });
            }
        }

        const created: StockMovementRead = {
            id: nextId++,
            product_id: payload.product_id,
            type: payload.type,
            quantity: payload.quantity,
            source_location_id: payload.source_location_id ?? null,
            target_location_id: payload.target_location_id ?? null,
            reason: payload.reason ?? null,
            user_id: 1, // aligne sur MOCK_USER dans auth.ts
            created_at: new Date().toISOString(),
        };
        stockMovements.push(created);
        saveMock("stock-movements", stockMovements);
        setStocks(applyMovement(getStocks(), payload));
        return HttpResponse.json(created, { status: 201 });
    }),
];
