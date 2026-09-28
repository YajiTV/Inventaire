import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getInitials, roleLabel } from '../lib/users'
import { ThemeToggle } from './ThemeToggle'

// The pad's tabs, grouped like the sections of the binder
const NAV_GROUPS = [
  { title: null, links: [{ to: '/', label: 'Accueil' }] },
  {
    title: 'Stock',
    links: [
      { to: '/stocks', label: 'Stocks' },
      { to: '/movements', label: 'Mouvements' },
    ],
  },
  {
    title: 'Achats',
    links: [
      { to: '/replenishment', label: 'Réapprovisionnement' },
      { to: '/orders', label: 'Commandes' },
    ],
  },
  {
    title: 'Catalogue',
    links: [
      { to: '/products', label: 'Produits' },
      { to: '/categories', label: 'Catégories' },
      { to: '/suppliers', label: 'Fournisseurs' },
      { to: '/locations', label: 'Emplacements' },
    ],
  },
  { title: 'Équipe', links: [{ to: '/users', label: 'Utilisateurs' }] },
]

const TAB = 'block px-4 py-2 text-sm lg:ml-3 lg:pl-3'
const TAB_IDLE = 'text-cover-ink/80 hover:bg-cover-2 hover:text-cover-ink'
const TAB_ACTIVE = 'bg-paper font-semibold text-ink'

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="text-xl font-extrabold uppercase tracking-tight font-stretch-condensed">
      Inventaire
    </Link>
  )
}

export function Layout() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <BinderLayout /> : <PublicLayout />
}

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="bg-cover text-cover-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="px-3 py-2 text-sm font-semibold hover:underline">
              Se connecter
            </Link>
            <Link to="/register" className="hidden h-9 items-center bg-paper px-3 text-sm font-semibold text-ink transition-transform duration-150 ease-out-strong active:scale-[0.97] sm:inline-flex">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

function BinderLayout() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="bg-cover text-cover-ink">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6 lg:pt-6 lg:pb-5">
          <Brand onClick={closeMenu} />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        <div id="main-menu" className={`${menuOpen ? 'flex' : 'hidden'} flex-1 flex-col pb-4 lg:flex lg:min-h-0`}>
          <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto">
            {NAV_GROUPS.map((group) => (
              <div key={group.title ?? 'home'} className="mb-4">
                {group.title && (
                  <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-widest font-stretch-condensed text-cover-ink/55 lg:px-6">
                    {group.title}
                  </p>
                )}
                <ul>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        end={link.to === '/'}
                        onClick={closeMenu}
                        className={({ isActive }) => `${TAB} ${isActive ? TAB_ACTIVE : TAB_IDLE}`}
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mx-4 flex items-center gap-2 border-t border-cover-ink/20 pt-4 lg:mx-6">
            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 items-center gap-3 py-1 ${isActive ? 'text-white' : 'text-cover-ink hover:text-white'}`
              }
            >
              <span className="flex size-9 shrink-0 items-center justify-center bg-paper text-sm font-bold text-ink">
                {user !== null ? getInitials(user.full_name, user.email) : ''}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{user?.full_name}</span>
                {user && <span className="block text-xs text-cover-ink/70">{roleLabel(user.role)}</span>}
              </span>
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[88rem]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
