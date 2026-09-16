import type { ErrorResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Porte le code HTTP jusqu'aux appelants : sans lui, un 409 ne se distingue
// pas d'un 500 et les ecrans ne peuvent pas reagir au cas metier.
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
    // Corps vide ou non JSON : on retombe sur le message generique.
  }

  return `Erreur API ${response.status} sur ${path}`
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // envoie/reçoit le cookie refresh token httpOnly
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response, path))
  }

  return response
}
