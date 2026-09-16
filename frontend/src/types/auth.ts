import type { UserRead } from './api'

export type User = UserRead

export interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  // Cree le compte via POST /users puis enchaine sur login (meme session que login()).
  register: (pseudo: string, email: string, password: string, confirm: string) => Promise<void>
  logout: () => Promise<void>
  // Appelle POST /auth/refresh (route implémentée par Axel côté backend) et pose un
  // nouveau access_token. Renvoie le token pour permettre un retry immédiat après un 401.
  refresh: () => Promise<string | null>
}
