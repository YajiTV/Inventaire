import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  {to: '/', label: 'Home'},
  { to: '/stocks', label: 'Stocks' },
  { to: '/movements', label: 'Mouvements' },
  { to: '/products', label: 'Produits' },
  { to: '/suppliers', label: 'Fournisseurs' },
  { to: '/replenishment', label: 'Réapprovisionnement' },
  { to: '/categories', label: 'Catégories' },
  { to: '/orders', label: 'Commandes' },
  { to: '/users', label: 'Utilisateurs' },
    { to: '/profile', label: 'Profil' },
]

export function Layout() {
  const { user, isAuthenticated, logout } = useAuth()

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
            {isAuthenticated ? (
              <>
                {user !== null && <span>{user.full_name}</span>}
                <button className="text-red-600" type="button" onClick={() => logout()}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Se connecter</Link>
                <Link to="/register">S'enregistrer</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
