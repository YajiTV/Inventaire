import type { UserRead, UserUpdate } from './api'

export type User = UserRead

export interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (pseudo: string, email: string, password: string, confirm: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<string | null>
  updateProfile: (data: UserUpdate) => Promise<void>
}
