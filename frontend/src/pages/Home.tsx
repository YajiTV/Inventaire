import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8">
      <p>Connecté en tant que {user?.full_name}</p>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/stocks">Stocks</Link>
        <Link to="/movements">Mouvements de stock</Link>
        <Link to="/products">Produits</Link>
        <Link to="/suppliers">Fournisseurs</Link>
      </nav>
      <button onClick={() => logout()}>Se déconnecter</button>
    </div>
  )
}
