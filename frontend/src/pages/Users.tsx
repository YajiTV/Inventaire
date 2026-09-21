import { UserForm } from '../components/UserForm'
import { UserTable } from '../components/UserTable'
import { useUsers } from '../hooks/useUsers'

export default function Users() {
  const { users, loading, error, addUser, editUser } = useUsers()

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Utilisateurs</h1>

      <UserForm onSubmit={addUser} />

      {loading && <p>Chargement des utilisateurs...</p>}
      {!loading && error !== null && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      {!loading && error === null && <UserTable users={users} onUpdate={editUser} />}
    </section>
  )
}
