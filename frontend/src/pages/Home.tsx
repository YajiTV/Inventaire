import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="p-4">
      {isAuthenticated ? <p>Bienvenue {user?.full_name}</p> : <p>Bienvenue sur l'inventaire, veuillez vous identifier</p>}
    </div>
  )
}
