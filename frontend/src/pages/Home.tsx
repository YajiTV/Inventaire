import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8">
      <p>Connecté en tant que {user?.full_name}</p>
      <button onClick={() => logout()}>Se déconnecter</button>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/produits">Produits</Link>
        <Link to="/fournisseurs">Fournisseurs</Link>
      </nav>
    </div>
  )
}
