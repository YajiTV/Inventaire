import { UserForm } from '../components/UserForm'
import { UserTable } from '../components/UserTable'
import { useUsers } from '../hooks/useUsers'

export default function Users() {
  const { users, loading, error, addUser, editUser } = useUsers()

  return (
    <section className="p-8">
      <h1 className="text-xl font-semibold mb-4">Utilisateurs</h1>

      <UserForm onSubmit={addUser} />

      {loading && <p>Chargement des utilisateurs...</p>}
      {error !== null && <p role="alert">{error}</p>}
      {!loading && error === null && <UserTable users={users} onUpdate={editUser} />}
    </section>
  )
}