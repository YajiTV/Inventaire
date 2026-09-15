import { http, HttpResponse } from 'msw'
import type { components } from '../../../types/api'

type TokenResponse = components['schemas']['TokenResponse']
type UserRead = components['schemas']['UserRead']

const MOCK_USER: UserRead = {
  id: 1,
  email: 'demo@inventaire.fr',
  full_name: 'Demo User',
  role: 'operator',
  is_active: true,
  created_at: new Date().toISOString(),
}

const MOCK_TOKEN: TokenResponse = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 900,
}

export const authHandlers = [
  http.post('*/auth/login', () => HttpResponse.json(MOCK_TOKEN)),

  http.get('*/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) return new HttpResponse(null, { status: 401 })
    return HttpResponse.json(MOCK_USER)
  }),

  http.post('*/auth/refresh', () => HttpResponse.json(MOCK_TOKEN)),

  http.post('*/auth/logout', () => new HttpResponse(null, { status: 204 })),
]
