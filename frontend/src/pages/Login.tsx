import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
    <div className="p-4 sm:p-8">
      <div className="mx-auto mt-10 max-w-sm rounded border p-6 shadow-sm sm:mt-20">
        <h1 className="mb-1 text-2xl font-semibold">Connexion</h1>
        <p className="mb-6 text-sm text-gray-500">Connecte-toi pour accéder à l'inventaire.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {error !== null && (
            <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="submit"
              className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
            >
              Se connecter
            </button>
            <Link to="/register" className="text-sm underline">
              S'enregistrer
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
