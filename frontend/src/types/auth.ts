import type { components } from './api'

export type User = components['schemas']['UserRead']

export interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  // Implémenté par Axel : relit le cookie refresh (httpOnly) et pose un nouveau access_token.
  refresh: () => Promise<void>
}
