import type { FormEvent } from 'react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { validateFullName } from '../lib/users'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (user === null) {
    return <p className="p-4 sm:p-8">Chargement du profil...</p>
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(false)

    const found = validateFullName(fullName)
    setErrors(found)
    if (found.length > 0) return

    setSaving(true)
    try {
      await updateProfile({ full_name: fullName.trim() })
      setSaved(true)
    } catch (err) {
      setErrors([(err as Error).message])
    } finally {
      setSaving(false)
    }
  }

  // Initiales pour l'avatar : premiere lettre des deux premiers mots du nom,
  // l'email en secours tant que le nom est vide.
  const initials = (user.full_name || user.email)
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto mt-10 max-w-sm rounded border p-6 shadow-sm sm:mt-20 dark:border-gray-700">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-xl font-semibold text-white dark:text-black">
            {initials}
          </div>
          <h1 className="text-2xl font-semibold">{user.full_name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <span className="mt-2 rounded-full border px-3 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-400">
            {user.role === 'admin' ? 'Admin' : 'Opérateur'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t pt-6 dark:border-gray-700">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-full-name" className="text-sm text-gray-700 dark:text-gray-300">
              Nom complet
            </label>
            <input
              id="profile-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-gray-600"
            />
          </div>

          {errors.map((error) => (
            <p key={error} role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          ))}

          {saved && (
            <p role="status" className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
              Informations mises à jour.
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => logout()} className="text-sm text-red-600 underline dark:text-red-400">
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
