import type { ErrorResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

let currentToken: string | null = null
let refreshToken: (() => Promise<string | null>) | null = null
let onSessionExpired: (() => void) | null = null

export function registerAuth(
  token: string | null,
  refresh: () => Promise<string | null>,
  sessionExpired: () => void,
) {
  currentToken = token
  refreshToken = refresh
  onSessionExpired = sessionExpired
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response: Response, path: string): Promise<string> {
  try {
    const body = (await response.json()) as ErrorResponse
    if (typeof body.detail === 'string' && body.detail !== '') {
      return body.detail
    }
  } catch {
    // empty or non-JSON body: fall back to the generic message
  }

  return `Erreur API ${response.status} sur ${path}`
}

async function callApi(path: string, options: RequestInit, token: string | null): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await callApi(path, options, currentToken)

  // Never retry /auth/*: a failing refresh would otherwise trigger refreshes forever
  const isAuthRoute = path.startsWith('/auth/')

  if (response.status === 401 && !isAuthRoute && refreshToken) {
    const newToken = await refreshToken()

    if (!newToken) {
      if (onSessionExpired) {
        onSessionExpired()
      }
      throw new ApiError(401, `Erreur API 401 sur ${path}`)
    }

    const retryResponse = await callApi(path, options, newToken)
    if (!retryResponse.ok) {
      throw new ApiError(retryResponse.status, await readErrorMessage(retryResponse, path))
    }
    return retryResponse
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response, path))
  }

  return response
}
