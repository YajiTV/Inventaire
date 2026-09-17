import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="p-8">
      {isAuthenticated ? (
        <>
          <p>Connecté en tant que {user?.full_name}</p>
          <button onClick={() => logout()}>Se déconnecter</button>
        </>
      ) : (
        <>
        <Link to="/login">Se connecter</Link>
        <Link to="/register">S'enregistrer</Link>
        </>
      )}
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/stocks">Stocks</Link>
        <Link to="/movements">Mouvements de stock</Link>
        <Link to="/products">Produits</Link>
        <Link to="/suppliers">Fournisseurs</Link>
        <Link to="/categories">Catégories</Link>
      </nav>
    </div>
  )
}
