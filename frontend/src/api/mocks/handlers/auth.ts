import { http, HttpResponse } from 'msw'
import type { TokenResponse, UserRead } from '../../../types/api'
import { users } from './users'
import { loadMock, saveMock } from '../storage'

let currentUser: UserRead | null = loadMock('auth:user', null)

const MOCK_TOKEN: TokenResponse = {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 900
}

export const authHandlers = [
    http.post('*/auth/login', async ({request}) => {
        const {email} = (await request.json()) as {email: string; password: string}
        const user = users.find((u) => u.email === email)
        if (!user)
            return new HttpResponse(null, {status: 401})
        currentUser = user
        saveMock('auth:user', currentUser)
        return HttpResponse.json(MOCK_TOKEN)
    }),

    http.get('*/auth/me', ({request}) => {
        const auth = request.headers.get('Authorization')
        if (!auth || !currentUser)
            return new HttpResponse(null, {status: 401})
        return HttpResponse.json(currentUser)
    }),

    http.post('*/auth/refresh', () => {
        if (!currentUser)
            return new HttpResponse(null, {status: 401})
        return HttpResponse.json(MOCK_TOKEN)
    }),

    http.post('*/auth/logout', () => {
        currentUser = null
        saveMock('auth:user', null)
        return new HttpResponse(null, {status: 204})
    })
]
