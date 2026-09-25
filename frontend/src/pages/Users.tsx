import { UserForm } from '../components/UserForm'
import { UserTable } from '../components/UserTable'
import { StatusMessage } from '../components/StatusMessage'
import { ActionFeedback } from '../components/ActionFeedback'
import { PageHeader } from '../components/PageHeader'
import { Workbench } from '../components/Workbench'
import { useUsers } from '../hooks/useUsers'
import { useActionFeedback } from '../hooks/useActionFeedback'
import type { UserCreate, UserUpdate } from '../types/api'

export default function Users() {
  const { users, loading, error, addUser, editUser } = useUsers()
  const feedback = useActionFeedback()

  return (
    <>
      <PageHeader title="Utilisateurs" />

      <Workbench
        formTitle="Nouvel utilisateur"
        form={<UserForm onSubmit={(data: UserCreate) => feedback.run(() => addUser(data), 'Utilisateur ajouté avec succès.')} />}
      >
        <ActionFeedback error={feedback.error} success={feedback.success} />
        <StatusMessage
          loading={loading}
          error={error}
          isEmpty={!loading && !error && users.length === 0}
          emptyMessage="Aucun utilisateur"
        />

        {!loading && !error && users.length > 0 && (
          <UserTable
            users={users}
            onUpdate={(id: number, data: UserUpdate) => feedback.run(() => editUser(id, data), 'Utilisateur modifié avec succès.')}
          />
        )}
      </Workbench>
    </>
  )
}
