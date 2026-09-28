import type { FormEvent } from 'react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getInitials, roleLabel, validateFullName } from '../lib/users'
import { ActionFeedback } from '../components/ActionFeedback'
import { Button } from '../components/Button'
import { ErrorList } from '../components/ErrorList'
import { FormField } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { StatusMessage } from '../components/StatusMessage'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (user === null) {
    return <StatusMessage loading />
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
    <>
      <PageHeader
        title="Profil"
        actions={
          <Button variant="danger" onClick={() => logout()}>
            Se déconnecter
          </Button>
        }
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center bg-ink text-2xl font-extrabold text-paper">
            {getInitials(user.full_name, user.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-2xl font-extrabold uppercase tracking-tight font-stretch-condensed">{user.full_name}</p>
            <p className="truncate text-ink-soft">
              {user.email}
              <span className="ml-3 inline-block bg-ink px-2 py-0.5 align-middle text-xs font-semibold uppercase tracking-wider font-stretch-condensed text-paper">
                {roleLabel(user.role)}
              </span>
            </p>
          </div>
        </div>

        <Section title="Modifier le profil">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <FormField id="profile-full-name" label="Nom complet" value={fullName} onChange={setFullName} placeholder="Marie Dupont" />
            <ErrorList errors={errors} />
            <ActionFeedback error={null} success={saved ? 'Informations mises à jour.' : null} />
            <div>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Section>
      </div>
    </>
  )
}
