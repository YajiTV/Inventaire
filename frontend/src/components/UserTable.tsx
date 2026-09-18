import { useState } from 'react'
import { validateFullName } from '../lib/users'
import type { UserRead, UserRole, UserUpdate } from '../types/api'

type UserTableProps = {
  users: UserRead[]
  onUpdate: (id: number, data: UserUpdate) => Promise<void>
}

export function UserTable({ users, onUpdate }: UserTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('operator')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editErrors, setEditErrors] = useState<string[]>([])

  if (users.length === 0) {
    return <p>Aucun utilisateur</p>
  }

  function startEdit(user: UserRead) {
    setEditingId(user.id)
    setEditFullName(user.full_name)
    setEditRole(user.role)
    setEditIsActive(user.is_active)
    setEditErrors([])
  }

  function cancelEdit() {
    setEditingId(null)
    setEditErrors([])
  }

  async function saveEdit(id: number) {
    const found = validateFullName(editFullName)
    setEditErrors(found)

    if (found.length > 0) return

    await onUpdate(id, {
      full_name: editFullName.trim(),
      role: editRole,
      is_active: editIsActive,
    })
    setEditingId(null)
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left border-b p-2">Email</th>
          <th className="text-left border-b p-2">Nom complet</th>
          <th className="text-left border-b p-2">Rôle</th>
          <th className="text-left border-b p-2">Actif</th>
          <th className="border-b p-2"></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="p-2">{user.email}</td>
            {editingId === user.id ? (
              <>
                <td className="p-2">
                  <input
                    value={editFullName}
                    onChange={(event) => setEditFullName(event.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={editRole}
                    onChange={(event) => setEditRole(event.target.value as UserRole)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="operator">Opérateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(event) => setEditIsActive(event.target.checked)}
                  />
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => saveEdit(user.id)} className="border rounded px-2 py-1">
                    Enregistrer
                  </button>
                  <button onClick={cancelEdit} className="border rounded px-2 py-1">
                    Annuler
                  </button>
                </td>
              </>
            ) : (
              <>
                <td className="p-2">{user.full_name}</td>
                <td className="p-2">{user.role === 'admin' ? 'Admin' : 'Opérateur'}</td>
                <td className="p-2">{user.is_active ? 'Oui' : 'Non'}</td>
                <td className="p-2">
                  <button onClick={() => startEdit(user)} className="border rounded px-2 py-1">
                    Modifier
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
      {editErrors.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan={5}>
              {editErrors.map((error) => (
                <p key={error} role="alert" className="text-red-600 text-sm p-2">
                  {error}
                </p>
              ))}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  )
}