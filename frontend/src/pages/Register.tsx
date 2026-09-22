import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from '../components/ThemeToggle'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsSubmitting(true)
    try {
      await register(pseudo, email, password, confirm)
      navigate('/')
    } catch {
      setError('Erreur dans les champs requis')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto flex max-w-sm justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-4 max-w-sm rounded border p-6 shadow-sm dark:border-gray-700">
        <h1 className="mb-1 text-2xl font-semibold">Créer un compte</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Renseigne tes informations pour t'enregistrer.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="pseudo" className="text-sm text-gray-700 dark:text-gray-300">
              Pseudo
            </label>
            <input
              id="pseudo"
              type="text"
              placeholder="Votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="8 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Retapez le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-gray-600"
            />
          </div>

          {error !== null && (
            <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300 dark:disabled:bg-gray-700"
            >
              {isSubmitting ? 'Création...' : "S'enregistrer"}
            </button>
            <Link to="/login" className="text-sm underline">
              Déjà un compte ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
