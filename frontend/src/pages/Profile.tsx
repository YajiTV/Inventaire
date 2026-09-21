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
    return <p>Chargement du profil...</p>
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

  return (
    <section className="p-8">
      <h1 className="text-xl font-semibold mb-4">Profil</h1>

      <dl className="mb-6">
        <dt className="font-semibold">Email</dt>
        <dd className="mb-2">{user.email}</dd>
        <dt className="font-semibold">Rôle</dt>
        <dd>{user.role === 'admin' ? 'Admin' : 'Opérateur'}</dd>
      </dl>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm">
        <label htmlFor="profile-full-name">Nom complet</label>
        <input
          id="profile-full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="border rounded px-2 py-1"
        />

        <button type="submit" disabled={saving} className="self-start border rounded px-3 py-1">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>

        {errors.map((error) => (
          <p key={error} role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        ))}

        {saved && (
          <p role="status" className="text-green-700 text-sm">
            Informations mises à jour.
          </p>
        )}
      </form>

      <button type="button" onClick={() => logout()} className="mt-6 border rounded px-3 py-1">
        Se déconnecter
      </button>
    </section>
  )
}