import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="border-b p-4">
      <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <li>
            <Link to="/stocks">Stocks</Link>
          </li>
          <li>
            <Link to="/movements">Mouvements de stock</Link>
          </li>
          <li>
            <Link to="/products">Produits</Link>
          </li>
          <li>
            <Link to="/suppliers">Fournisseurs</Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span>Bienvenue {user?.full_name}</span>
              <button className='text-red-600'type="button" onClick={() => logout()}>
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
  )
}
