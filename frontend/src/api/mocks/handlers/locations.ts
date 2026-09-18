import { http, HttpResponse } from "msw";
import type { LocationCreate, LocationRead, LocationUpdate } from "../../../types/api";
import { nextIdFrom, seedLocations } from "../seed";

let locations: LocationRead[] = [...seedLocations];

let nextId = nextIdFrom(seedLocations);

export const locationHandlers = [
    http.get("*/locations", () => HttpResponse.json(locations)),

    http.post("*/locations", async ({ request }) => {
        const payload = (await request.json()) as LocationCreate;
        const createLocations: LocationRead = { id: nextId++, description: null, ...payload };
        locations.push(createLocations);
        return HttpResponse.json(createLocations, { status: 201 });
    }),

    http.get("*/locations/:id", ({ params }) => {
        const location = locations.find(l => l.id === Number(params.id));
        if (!location) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(location);
    }),

    http.patch("*/locations/:id", async ({ params, request }) => {
        const location = locations.find(l => l.id === Number(params.id));
        if (!location) return new HttpResponse(null, { status: 404 });
        const patch = (await request.json()) as LocationUpdate;
        Object.assign(location, patch);
        return HttpResponse.json(location);
    }),

    http.delete("*/locations/:id", ({ params }) => {
        const exists = locations.some(l => l.id === Number(params.id));
        if (!exists) return new HttpResponse(null, { status: 404 });
        locations = locations.filter(c => c.id !== Number(params.id));
        return new HttpResponse(null, { status: 204 });
    }),
];
