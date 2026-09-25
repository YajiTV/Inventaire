import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateUserCreate } from '../lib/users'
import { AuthSheet } from '../components/AuthSheet'
import { Button } from '../components/Button'
import { ErrorList } from '../components/ErrorList'
import { FIELD_BOX, FIELD_CONTROL, FIELD_LABEL } from '../lib/ui'
import { FormField } from '../components/FormField'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors([])

    const found = validateUserCreate({ email: email.trim(), full_name: pseudo, password })
    if (password !== confirm) found.push('Les mots de passe ne correspondent pas.')
    if (found.length > 0) {
      setErrors(found)
      return
    }

    setIsSubmitting(true)
    try {
      await register(pseudo.trim(), email.trim(), password, confirm)
      navigate('/')
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Inscription impossible'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthSheet title="Créer un compte">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <FormField id="pseudo" label="Pseudo" placeholder="marie.d" value={pseudo} onChange={setPseudo} required />
        <FormField id="email" label="Email" type="email" placeholder="vous@exemple.fr" value={email} onChange={setEmail} required />

        <div className={`${FIELD_BOX} border-rule-strong`}>
          <label htmlFor="password" className={FIELD_LABEL}>
            Mot de passe <span className="text-stamp">*</span>
          </label>
          <div className="flex items-center">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={FIELD_CONTROL}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="shrink-0 px-2 pb-1.5 text-sm font-semibold text-print hover:text-ink"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        <FormField
          id="confirm"
          label="Confirmer le mot de passe"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
        />

        <ErrorList errors={errors} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : "S'enregistrer"}
          </Button>
          <Link to="/login" className="text-sm font-semibold hover:underline">
            Déjà un compte ?
          </Link>
        </div>
      </form>
    </AuthSheet>
  )
}
