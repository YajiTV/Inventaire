import type { FormEvent } from 'react'
import { useState } from 'react'
import { validateUserCreate } from '../lib/users'
import type { UserCreate } from '../types/api'
import { FormField } from './FormField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'

type UserFormProps = {
  onSubmit: (user: UserCreate) => Promise<boolean>
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // No role field: this endpoint always creates operators, an admin is promoted afterwards from the table
    const user: UserCreate = {
      email: email.trim(),
      full_name: fullName.trim(),
      password,
    }

    const found = validateUserCreate(user)
    setErrors(found)
    if (found.length > 0) return

    if (await onSubmit(user)) {
      setEmail('')
      setFullName('')
      setPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <FormField id="user-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="prenom@inventaire.fr" required />
      <FormField id="user-full-name" label="Nom complet" value={fullName} onChange={setFullName} placeholder="Marie Dupont" required />
      <FormField id="user-password" label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" required />
      <p className="text-xs text-ink-soft">
        Le compte est créé en tant qu'opérateur. Pour un rôle admin, modifiez-le ensuite dans le tableau ci-dessous.
      </p>
      <ErrorList errors={errors} />
      <Button type="submit" variant="primary">
        Ajouter l'utilisateur
      </Button>
    </form>
  )
}
