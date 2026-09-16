import {http , HttpResponse} from 'msw';
import type { components } from '../../../types/api';

type LocationsRead = components['schemas']['LocationRead']
type LocationCreate = components['schemas']['LocationCreate']
type LocationUpdate = components['schemas']['LocationUpdate']

let locations: LocationsRead[] = [
    {id: 1, code: 'Kiosk-01', name: 'Kiosk', description: null}
]

let nextId = 2

export const locationHandlers = [
    http.get('*/locations', () => HttpResponse.json(locations)),

    http.post('*/locations', async ({request}) => {
        const payload = (await request.json()) as LocationCreate
        const createLocations: LocationsRead = { id: nextId++, description: null, ...payload}
        locations.push(createLocations)
        return HttpResponse.json(createLocations, { status : 201})
    }),

    http.get('*/locations/:id', ({params}) => {
        const location = locations.find((l) => l.id === Number(params.id))
        if (!location)
            return new HttpResponse(null, {status: 404})
        return HttpResponse.json(location)
    }),

    http.patch('*/locations/:id', async ({params, request}) => {
        const location = locations.find((l)=> l.id === Number(params.id))
        if (!location)
            return new HttpResponse(null, {status : 404})
        const patch = (await request.json()) as LocationUpdate
        Object.assign(location, patch)
        return HttpResponse.json(location)
    }),

    http.delete('*/locations/:id', ({params}) =>{
    const exists = locations.some((l) => l.id === Number(params.id))
    if (!exists)
        return new HttpResponse(null, {status : 404})
    locations = locations.filter((c) => c.id !== Number(params.id))
    return new HttpResponse(null, {status : 204})
}),




]
