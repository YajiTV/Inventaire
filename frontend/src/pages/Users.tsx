import { UserForm } from '../components/UserForm'
import { UserTable } from '../components/UserTable'
import { StatusMessage } from '../components/StatusMessage'
import { ActionFeedback } from '../components/ActionFeedback'
import { useUsers } from '../hooks/useUsers'
import { useActionFeedback } from '../hooks/useActionFeedback'
import type { UserCreate, UserUpdate } from '../types/api'

export default function Users() {
  const { users, loading, error, addUser, editUser } = useUsers()
  const feedback = useActionFeedback()

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Utilisateurs</h1>

      <UserForm onSubmit={(data: UserCreate) => feedback.run(() => addUser(data), 'Utilisateur ajouté avec succès.')} />

      <StatusMessage
        loading={loading}
        error={error}
        isEmpty={!loading && !error && users.length === 0}
        emptyMessage="Aucun utilisateur"
      />
      <ActionFeedback error={feedback.error} success={feedback.success} />

      {!loading && !error && users.length > 0 && (
        <UserTable
          users={users}
          onUpdate={(id: number, data: UserUpdate) => feedback.run(() => editUser(id, data), 'Utilisateur modifié avec succès.')}
        />
      )}
    </section>
  )
}
