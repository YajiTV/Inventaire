import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8">
      <p>Connecté en tant que {user?.full_name}</p>
      <button onClick={() => logout()}>Se déconnecter</button>
    </div>
  )
}
