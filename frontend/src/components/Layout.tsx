import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  {to: '/', label: 'Home'},
  { to: '/stocks', label: 'Stocks' },
  { to: '/movements', label: 'Mouvements' },
  { to: '/products', label: 'Produits' },
  { to: '/suppliers', label: 'Fournisseurs' },
  { to: '/replenishment', label: 'Réapprovisionnement' },
  { to: '/categories', label: 'Catégories' },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div>
      <header className="border-b p-4">
        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={({ isActive }) => (isActive ? 'font-semibold underline' : '')}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {user !== null && <span>{user.full_name}</span>}
            <button type="button" onClick={() => logout()}>
              Se déconnecter
            </button>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
