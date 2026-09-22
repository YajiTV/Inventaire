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
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="user-email" className="mb-1 block text-sm">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="user-full-name" className="mb-1 block text-sm">
            Nom complet
          </label>
          <input
            id="user-full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="user-password" className="mb-1 block text-sm">
            Mot de passe
          </label>
          <input
            id="user-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="user-role" className="mb-1 block text-sm">
            Rôle
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="operator">Opérateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div>
        <button type="submit" className="rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
          Ajouter
        </button>
      </div>

      {errors.map((error) => (
        <p key={error} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ))}
    </form>
  )
}
