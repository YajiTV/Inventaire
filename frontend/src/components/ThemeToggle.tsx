import { useTheme } from '../hooks/useTheme'

// Bouton reutilise partout (Layout, Login, Register) : ces deux dernieres
// pages sont hors <Layout> et n'heriteraient sinon d'aucun moyen de basculer.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="rounded border px-2 py-1 text-sm dark:border-gray-600"
      type="button"
      onClick={toggleTheme}
      aria-label="Changer de theme"
    >
      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    </button>
  )
}
