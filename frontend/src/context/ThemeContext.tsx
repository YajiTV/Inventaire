import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Theme, ThemeContextValue } from '../types/theme'

const STORAGE_KEY = 'inventaire:theme'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

// Preference d'affichage uniquement (pas de donnee metier) : autorise en localStorage.
function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage indisponible (navigation privee, etc.) : on retombe sur l'OS
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Repercute le theme sur <html> (classe lue par @custom-variant dark) et le persiste
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // rien a faire si le stockage est bloque
    }
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const value: ThemeContextValue = { theme, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
