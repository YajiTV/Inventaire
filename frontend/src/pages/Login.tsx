import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {Link} from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm rounded border p-6">
      <h1 className="mb-6 text-xl font-semibold">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex items-center gap-4">
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700">
            Se connecter
          </button>
          <Link to="/register" className="text-sm underline">
            S'enregistrer
          </Link>
        </div>
      </form>
    </div>
  )
}
