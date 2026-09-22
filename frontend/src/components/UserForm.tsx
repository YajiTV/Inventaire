import type { FormEvent } from 'react'
import { useState } from 'react'
import { ROLE_OPTIONS, validateUserCreate } from '../lib/users'
import type { UserCreate, UserRole } from '../types/api'
import { FormField } from './FormField'
import { SelectField } from './SelectField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'

type UserFormProps = {
  onSubmit: (user: UserCreate) => Promise<boolean>
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('operator')
  const [errors, setErrors] = useState<string[]>([])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const user: UserCreate = {
      email: email.trim(),
      full_name: fullName.trim(),
      password,
      role,
    }

    const found = validateUserCreate(user)
    setErrors(found)
    if (found.length > 0) return

    if (await onSubmit(user)) {
      setEmail('')
      setFullName('')
      setPassword('')
      setRole('operator')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mb-4 flex flex-wrap gap-2">
      <FormField id="user-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="prenom@inventaire.fr" required />
      <FormField id="user-full-name" label="Nom complet" value={fullName} onChange={setFullName} placeholder="Marie Dupont" required />
      <FormField id="user-password" label="Mot de passe" type="password" value={password} onChange={setPassword} required />
      <SelectField
        id="user-role"
        label="Rôle"
        value={role}
        onChange={(value) => setRole(value as UserRole)}
        options={ROLE_OPTIONS}
      />
      <Button type="submit">Ajouter</Button>
      <ErrorList errors={errors} />
    </form>
  )
}
