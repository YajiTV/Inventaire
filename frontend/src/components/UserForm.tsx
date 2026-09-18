import type { FormEvent } from 'react'
import { useState } from 'react'
import { validateUserCreate } from '../lib/users'
import type { UserCreate, UserRole } from '../types/api'

type UserFormProps = {
  onSubmit: (user: UserCreate) => void
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('operator')
  const [errors, setErrors] = useState<string[]>([])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const user: UserCreate = {
      email: email.trim(),
      full_name: fullName.trim(),
      password,
      role,
    }

    const found = validateUserCreate(user)
    setErrors(found)

    if (found.length === 0) {
      onSubmit(user)
      setEmail('')
      setFullName('')
      setPassword('')
      setRole('operator')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
      <div className="flex flex-col">
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="user-full-name">Nom complet</label>
        <input
          id="user-full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="user-password">Mot de passe</label>
        <input
          id="user-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="user-role">Rôle</label>
        <select
          id="user-role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="border rounded px-2 py-1"
        >
          <option value="operator">Opérateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" className="self-end border rounded px-3 py-1">
        Ajouter
      </button>

      {errors.map((error) => (
        <p key={error} role="alert" className="w-full text-red-600 text-sm">
          {error}
        </p>
      ))}
    </form>
  )
}