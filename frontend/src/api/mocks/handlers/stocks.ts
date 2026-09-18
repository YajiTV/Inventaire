import { http, HttpResponse } from "msw";
import type { StockCreate, StockRead, StockUpdate } from "../../../types/api";
import { nextIdFrom, seedStocks } from "../seed";
import { loadMock, saveMock } from "../storage";

let stocks: StockRead[] = loadMock("stocks", [...seedStocks]);

let nextId = nextIdFrom(stocks);

// Partage de l'etat avec le handler des mouvements : un mouvement doit deplacer
// le stock, sinon la demo montre un historique qui ne change rien.
export function getStocks(): StockRead[] {
    return stocks;
}

export function setStocks(next: StockRead[]): void {
    stocks = next;
    saveMock("stocks", stocks);
}

export const stockHandlers = [
    http.get("*/stocks", () => HttpResponse.json(stocks)),

    http.post("*/stocks", async ({ request }) => {
        const payload = (await request.json()) as StockCreate;
        const created: StockRead = { id: nextId++, ...payload };
        stocks.push(created);
        saveMock("stocks", stocks);
        return HttpResponse.json(created, { status: 201 });
    }),

    http.get("*/stocks/:id", ({ params }) => {
        const stock = stocks.find(s => s.id === Number(params.id));
        if (!stock) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(stock);
    }),

    // StockUpdate ne permet de modifier que la quantite (product_id/location_id fixent
    // la contrainte d'unicite cote backend, ils ne se changent pas apres coup).
    http.patch("*/stocks/:id", async ({ params, request }) => {
        const stock = stocks.find(s => s.id === Number(params.id));
        if (!stock) return new HttpResponse(null, { status: 404 });
        const patch = (await request.json()) as StockUpdate;
        Object.assign(stock, patch);
        saveMock("stocks", stocks);
        return HttpResponse.json(stock);
    }),

    http.delete("*/stocks/:id", ({ params }) => {
        const exists = stocks.some(s => s.id === Number(params.id));
        if (!exists) return new HttpResponse(null, { status: 404 });
        stocks = stocks.filter(s => s.id !== Number(params.id));
        saveMock("stocks", stocks);
        return new HttpResponse(null, { status: 204 });
    }),
];
