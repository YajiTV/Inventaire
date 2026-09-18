import { http, HttpResponse } from "msw";
import type { CategoryCreate, CategoryRead, CategoryUpdate } from "../../../types/api";
import { nextIdFrom, seedCategories } from "../seed";
import { loadMock, saveMock } from "../storage";

let categories: CategoryRead[] = loadMock("categories", [...seedCategories]);

let nextId = nextIdFrom(categories);

export const categoryHandlers = [
    http.get("*/categories", () => HttpResponse.json(categories)),

    http.post("*/categories", async ({ request }) => {
        const payload = (await request.json()) as CategoryCreate;
        const created: CategoryRead = { id: nextId++, description: null, ...payload };
        categories.push(created);
        saveMock("categories", categories);
        return HttpResponse.json(created, { status: 201 });
    }),

    http.get("*/categories/:id", ({ params }) => {
        const category = categories.find(c => c.id === Number(params.id));
        if (!category) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(category);
    }),

    http.patch("*/categories/:id", async ({ params, request }) => {
        const category = categories.find(c => c.id === Number(params.id));
        if (!category) return new HttpResponse(null, { status: 404 });
        const patch = (await request.json()) as CategoryUpdate;
        Object.assign(category, patch);
        saveMock("categories", categories);
        return HttpResponse.json(category);
    }),

    http.delete("*/categories/:id", ({ params }) => {
        const exists = categories.some(c => c.id === Number(params.id));
        if (!exists) return new HttpResponse(null, { status: 404 });
        categories = categories.filter(c => c.id !== Number(params.id));
        saveMock("categories", categories);
        return new HttpResponse(null, { status: 204 });
    }),
];
