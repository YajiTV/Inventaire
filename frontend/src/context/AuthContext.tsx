import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthContextValue, User } from '../types/auth'
import { apiFetch, registerAuth } from '../lib/api'
import type { TokenResponse } from '../types/api'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: {children: ReactNode}) {
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    async function login(email: string, password: string) {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password})
        })
        const data: TokenResponse = await response.json()
        setAccessToken(data.access_token)

        // header manuel : le state accessToken n'est pas encore a jour ici
        const meResponse = await apiFetch('/auth/me', {
            headers: {Authorization: `Bearer ${data.access_token}`}
        })
        setUser(await meResponse.json())
    }

    async function logout() {
        await apiFetch('/auth/logout', {method: 'POST'})
        setAccessToken(null)
        setUser(null)
    }

    // Pose un nouveau access token a partir du cookie refresh, renvoie le token
    async function refresh(): Promise<string | null> {
        try {
            const response = await apiFetch('/auth/refresh', {method: 'POST'})
            const data: TokenResponse = await response.json()
            setAccessToken(data.access_token)

            const meResponse = await apiFetch('/auth/me', {
                headers: {Authorization: `Bearer ${data.access_token}`}
            })
            setUser(await meResponse.json())

            return data.access_token
        } catch {
            setAccessToken(null)
            setUser(null)
            return null
        }
    }

    function handleSessionExpired() {
        setAccessToken(null)
        setUser(null)
    }

    // Tente de restaurer une session existante au chargement
    useEffect(() => {
        refresh().finally(() => setIsLoading(false))
    }, [])

    // Donne a apiFetch (hors React) le token courant et les fonctions refresh/logout
    useEffect(() => {
        registerAuth(accessToken, refresh, handleSessionExpired)
    })

    const value: AuthContextValue = {
        user,
        accessToken,
        isAuthenticated: accessToken !== null,
        isLoading,
        login,
        logout,
        refresh
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
