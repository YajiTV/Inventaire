import { createContext } from 'react'
import type { AuthContextValue } from '../types/auth'

// Séparé de AuthProvider : un fichier de composants ne doit exporter que des composants (Fast Refresh)
export const AuthContext = createContext<AuthContextValue | null>(null)
