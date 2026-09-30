import { http, HttpResponse } from 'msw'
import type { UserRead, UserCreate, UserUpdate } from '../../../types/api'
import { nextIdFrom } from '../seed'
import { loadMock, saveMock } from '../storage'

const seedUsers: UserRead[] = [
    {
        id: 1,
        email: 'admin@inventaire.fr',
        full_name: 'Admin Principal',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
    }
]

export let users: UserRead[] = loadMock('users', seedUsers)

let nextId = nextIdFrom(users)

function addUser(payload: UserCreate, role: UserRead['role']): UserRead {
    const created: UserRead = {
        id: nextId++,
        email: payload.email,
        full_name: payload.full_name,
        role,
        is_active: true,
        created_at: new Date().toISOString()
    }
    users.push(created)
    saveMock('users', users)
    return created
}

export const userHandlers = [
    http.get('*/users', () => HttpResponse.json(users)),

    http.post('*/auth/register', async ({request}) => {
        const payload = (await request.json()) as UserCreate
        return HttpResponse.json(addUser(payload, 'operator'), {status: 201})
    }),

    http.post('*/users', async ({request}) => {
        const payload = (await request.json()) as UserCreate
        return HttpResponse.json(addUser(payload, payload.role ?? 'operator'), {status: 201})
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
        saveMock('users', users)
        return HttpResponse.json(user)
    }),

    http.delete('*/users/:id', ({params}) => {
        const exists = users.some((u) => u.id === Number(params.id))
        if (!exists)
            return new HttpResponse(null, {status: 404})
        users = users.filter((u) => u.id !== Number(params.id))
        saveMock('users', users)
        return new HttpResponse(null, {status: 204})
    })
]
