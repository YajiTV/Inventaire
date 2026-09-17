import { http, HttpResponse } from 'msw'
import type { UserRead, UserCreate, UserUpdate } from '../../../types/api'

export let users: UserRead[] = [
    {
        id: 1,
        email: 'admin@inventaire.fr',
        full_name: 'Admin Principal',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
    }
]

let nextId = 2

export const userHandlers = [
    http.get('*/users', () => HttpResponse.json(users)),

    http.post('*/users', async ({request}) => {
        const payload = (await request.json()) as UserCreate
        // UserCreate contient un password : on ne le fait pas passer dans UserRead, qui ne l'expose jamais.
        const created: UserRead = {
            id: nextId++,
            email: payload.email,
            full_name: payload.full_name,
            role: payload.role ?? 'operator',
            is_active: true,
            created_at: new Date().toISOString()
        }
        users.push(created)
        return HttpResponse.json(created, {status: 201})
    }),

    http.get('*/users/:id', ({params}) => {
        const user = users.find((u) => u.id === Number(params.id))
        if (!user)
            return new HttpResponse(null, {status: 404})
        return HttpResponse.json(user)
    }),

    http.patch('*/users/:id', async ({params, request}) => {
        const user = users.find((u) => u.id === Number(params.id))
        if (!user)
            return new HttpResponse(null, {status: 404})
        const patch = (await request.json()) as UserUpdate
        Object.assign(user, patch)
        return HttpResponse.json(user)
    }),

    http.delete('*/users/:id', ({params}) => {
        const exists = users.some((u) => u.id === Number(params.id))
        if (!exists)
            return new HttpResponse(null, {status: 404})
        users = users.filter((u) => u.id !== Number(params.id))
        return new HttpResponse(null, {status: 204})
    })
]
