import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthContextValue, User } from '../types/auth'
import { apiFetch } from '../lib/api'
import type { components } from '../types/api'

type TokenResponse = components['schemas']['TokenResponse']

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data: TokenResponse = await response.json()
    setAccessToken(data.access_token)

    const meResponse = await apiFetch('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    setUser(await meResponse.json())
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    setAccessToken(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    // TODO Axel : POST /auth/refresh avec credentials: include puis setAccessToken(nouveauToken).
  }, [])

  useEffect(() => {
  refresh().finally(() => setIsLoading(false))
}, [refresh])


  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: accessToken !== null,
      isLoading,
      login,
      logout,
      refresh,
    }),
    [user, accessToken, isLoading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
