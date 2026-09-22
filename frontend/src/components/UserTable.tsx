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
    return <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">Aucun utilisateur.</p>
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
    <div className="overflow-x-auto rounded border dark:border-gray-700">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Nom complet</th>
            <th className="px-3 py-2 font-medium">Rôle</th>
            <th className="px-3 py-2 font-medium">Actif</th>
            <th className="px-3 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t dark:border-gray-700">
              <td className="px-3 py-2 font-medium">{user.email}</td>
              {editingId === user.id ? (
                <>
                  <td className="px-3 py-2">
                    <input
                      value={editFullName}
                      onChange={(event) => setEditFullName(event.target.value)}
                      className="w-full min-w-32 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={editRole}
                      onChange={(event) => setEditRole(event.target.value as UserRole)}
                      className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="operator">Opérateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(event) => setEditIsActive(event.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(user.id)}
                        className="whitespace-nowrap rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                      >
                        Enregistrer
                      </button>
                      <button onClick={cancelEdit} className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                        Annuler
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2">{user.full_name}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{user.role === 'admin' ? 'Admin' : 'Opérateur'}</td>
                  <td className="px-3 py-2">
                    {user.is_active ? (
                      <span className="text-xs text-green-700 dark:text-green-400">Oui</span>
                    ) : (
                      <span className="text-xs text-red-700 dark:text-red-400">Non</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => startEdit(user)} className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
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
            <tr className="border-t dark:border-gray-700">
              <td colSpan={5} className="px-3 py-2">
                {editErrors.map((error) => (
                  <p key={error} role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ))}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
