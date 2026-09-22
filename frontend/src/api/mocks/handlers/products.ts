import { http, HttpResponse } from "msw";
import type { ProductCreate, ProductLookup, ProductRead, ProductUpdate } from "../../../types/api";
import { nextIdFrom, seedProducts } from "../seed";
import { loadMock, saveMock } from "../storage";

let products: ProductRead[] = loadMock("products", [...seedProducts]);

let nextId = nextIdFrom(products);

const knownLookups: Record<string, ProductLookup> = {
    "3017620422003": {
        barcode: "3017620422003",
        name: "Nutella",
        description: "Pâte à tartiner aux sucre avec un peu de cacoa, mais surtout du sucre",
        image_url: null,
    },
};

export const productHandlers = [
    http.get("*/products", ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") ?? 20);
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const q = url.searchParams.get("q")?.toLowerCase();
        const categoryId = url.searchParams.get("category_id");
        const supplierId = url.searchParams.get("supplier_id");
        const belowThreshold = url.searchParams.get("below_threshold") === "true";

        const matching = products.filter(p =>
            (!q || [p.name, p.sku, p.barcode ?? ""].some(value => value.toLowerCase().includes(q))) &&
            (!categoryId || p.category_id === Number(categoryId)) &&
            (!supplierId || p.supplier_id === Number(supplierId)) &&
            (!belowThreshold || p.total_quantity <= p.reorder_threshold)
        );

        return HttpResponse.json({
            items: matching.slice(offset, offset + limit),
            total: matching.length,
            limit,
            offset,
        });
    }),

    http.post("*/products", async ({ request }) => {
        const payload = (await request.json()) as ProductCreate;
        const created: ProductRead = {
            id: nextId++,
            description: null,
            supplier_id: null,
            barcode: null,
            total_quantity: 0,
            ...payload,
            reorder_threshold: payload.reorder_threshold ?? 0,
            unit_price: String(payload.unit_price),
        };
        products.push(created);
        saveMock("products", products);
        return HttpResponse.json(created, { status: 201 });
    }),

    http.get("*/products/lookup/:barcode", ({ params }) => {
        const lookup = knownLookups[String(params.barcode)];
        if (!lookup) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(lookup);
    }),

    http.get("*/products/:id", ({ params }) => {
        const product = products.find(p => p.id === Number(params.id));
        if (!product) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(product);
    }),

    http.patch("*/products/:id", async ({ params, request }) => {
        const product = products.find(p => p.id === Number(params.id));
        if (!product) return new HttpResponse(null, { status: 404 });
        const patch = (await request.json()) as ProductUpdate;
        Object.assign(product, {
            ...patch,
            ...(patch.unit_price !== undefined && patch.unit_price !== null
                ? { unit_price: String(patch.unit_price) }
                : {}),
        });
        saveMock("products", products);
        return HttpResponse.json(product);
    }),

    http.delete("*/products/:id", ({ params }) => {
        const exists = products.some(p => p.id === Number(params.id));
        if (!exists) return new HttpResponse(null, { status: 404 });
        products = products.filter(p => p.id !== Number(params.id));
        saveMock("products", products);
        return new HttpResponse(null, { status: 204 });
    }),
];
