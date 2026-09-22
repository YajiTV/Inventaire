import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getInitials } from '../lib/users'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/stocks', label: 'Stocks' },
  { to: '/movements', label: 'Mouvements' },
  { to: '/products', label: 'Produits' },
  { to: '/suppliers', label: 'Fournisseurs' },
  { to: '/replenishment', label: 'Réapprovisionnement' },
  { to: '/categories', label: 'Catégories' },
  { to: '/orders', label: 'Commandes' },
  { to: '/locations', label: 'Emplacements' },
  { to: '/users', label: 'Utilisateurs' },
]

const LINK = 'block rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
const ACTIVE_LINK = 'bg-gray-100 font-semibold dark:bg-gray-800'
const BUTTON = 'rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
const PRIMARY_BUTTON = 'rounded bg-gray-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-gray-900'

export function Layout() {
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const visibleLinks = isAuthenticated ? links : links.slice(0, 1)

  const account = (
    <div className="flex flex-wrap items-center gap-2">
      <ThemeToggle />
      {isAuthenticated ? (
        <NavLink
          to="/profile"
          onClick={closeMenu}
          aria-label="Profil"
          title={user?.full_name}
          className={({ isActive }) =>
            `flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 font-semibold text-white dark:bg-white dark:text-black ${isActive ? 'ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`
          }
        >
          {user !== null ? getInitials(user.full_name, user.email) : ''}
        </NavLink>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu} className={BUTTON}>
            Se connecter
          </Link>
          <Link to="/register" onClick={closeMenu} className={PRIMARY_BUTTON}>
            Créer un compte
          </Link>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link to="/" onClick={closeMenu} className="text-lg font-bold">
            Inventaire
          </Link>

          <div className="hidden lg:block">{account}</div>

          <button
            type="button"
            className={`${BUTTON} lg:hidden`}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? 'Fermer' : 'Menu'}
          </button>
        </div>

        <nav
          id="main-menu"
          className={`${menuOpen ? 'block' : 'hidden'} ${isAuthenticated ? 'lg:block' : 'lg:hidden'} border-t px-4 py-3 sm:px-8 lg:py-2 dark:border-gray-700`}
        >
          <ul className="flex flex-col gap-1 lg:flex-row lg:flex-wrap">
            {visibleLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) => `${LINK} ${isActive ? ACTIVE_LINK : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t pt-3 lg:hidden dark:border-gray-700">{account}</div>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
