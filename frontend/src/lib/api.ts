const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Rempli par AuthContext via registerAuth (apiFetch n'est pas un hook)
let currentToken: string | null = null
let refreshToken: (() => Promise<string | null>) | null = null
let onSessionExpired: (() => void) | null = null

export function registerAuth(
    token: string | null,
    refresh: () => Promise<string | null>,
    sessionExpired: () => void
) {
    currentToken = token
    refreshToken = refresh
    onSessionExpired = sessionExpired
}

async function callApi(path: string, options: RequestInit, token: string | null): Promise<Response> {
    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: 'include', // envoie/reçoit le cookie refresh token httpOnly
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...options.headers
        }
    })
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const response = await callApi(path, options, currentToken)

    // Pas d'intercepteur sur /auth/* : sinon un refresh qui echoue en 401
    // relancerait un refresh a l'infini.
    const isAuthRoute = path.startsWith('/auth/')

    if (response.status === 401 && !isAuthRoute && refreshToken) {
        // Token expire : on tente un refresh puis on rejoue la requete une fois
        const newToken = await refreshToken()

        if (!newToken) {
            if (onSessionExpired) {
                onSessionExpired()
            }
            throw new Error(`Erreur API 401 sur ${path}`)
        }

        const retryResponse = await callApi(path, options, newToken)
        if (!retryResponse.ok) {
            throw new Error(`Erreur API ${retryResponse.status} sur ${path}`)
        }
        return retryResponse
    }

    if (!response.ok) {
        throw new Error(`Erreur API ${response.status} sur ${path}`)
    }

    return response
}
