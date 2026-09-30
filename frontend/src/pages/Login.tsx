import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthSheet } from '../components/AuthSheet'
import { Button } from '../components/Button'
import { ErrorList } from '../components/ErrorList'
import { FormField } from '../components/FormField'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError("L'email et le mot de passe sont obligatoires.")
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthSheet title="Connexion">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <FormField id="email" label="Email" type="email" placeholder="vous@exemple.fr" value={email} onChange={setEmail} required />
        <FormField id="password" label="Mot de passe" type="password" value={password} onChange={setPassword} required />

        {error !== null && <ErrorList errors={[error]} />}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
          <Link to="/register" className="text-sm font-semibold hover:underline">
            Créer un compte
          </Link>
        </div>
      </form>
    </AuthSheet>
  )
}
