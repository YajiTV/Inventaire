import { useState } from 'react'
import { ROLE_OPTIONS, roleLabel, validateFullName } from '../lib/users'
import type { UserRead, UserRole, UserUpdate } from '../types/api'
import { DataTable } from './DataTable'
import type { DataTableColumn } from './DataTable'
import { FormField } from './FormField'
import { SelectField } from './SelectField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'

type UserTableProps = {
  users: UserRead[]
  onUpdate: (id: number, data: UserUpdate) => Promise<boolean>
}

export function UserTable({ users, onUpdate }: UserTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('operator')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editErrors, setEditErrors] = useState<string[]>([])

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

    const saved = await onUpdate(id, {
      full_name: editFullName.trim(),
      role: editRole,
      is_active: editIsActive,
    })
    if (saved) setEditingId(null)
  }

  const columns: DataTableColumn<UserRead>[] = [
    { header: 'Email', render: (u) => u.email },
    {
      header: 'Nom complet',
      render: (u) =>
        editingId === u.id ? (
          <FormField id={`edit-full-name-${u.id}`} label="" value={editFullName} onChange={setEditFullName} />
        ) : (
          u.full_name
        ),
    },
    {
      header: 'Rôle',
      render: (u) =>
        editingId === u.id ? (
          <SelectField
            id={`edit-role-${u.id}`}
            label=""
            value={editRole}
            onChange={(value) => setEditRole(value as UserRole)}
            options={ROLE_OPTIONS}
          />
        ) : (
          roleLabel(u.role)
        ),
    },
    {
      header: 'Actif',
      render: (u) =>
        editingId === u.id ? (
          <input type="checkbox" checked={editIsActive} onChange={(event) => setEditIsActive(event.target.checked)} />
        ) : u.is_active ? (
          <span className="text-xs text-green-700 dark:text-green-400">Oui</span>
        ) : (
          <span className="text-xs text-red-700 dark:text-red-400">Non</span>
        ),
    },
  ]

  return (
    <>
      <ErrorList errors={editErrors} />
      <DataTable
        columns={columns}
        rows={users}
        getRowId={(u) => u.id}
        renderActions={(u) =>
          editingId === u.id ? (
            <>
              <Button onClick={() => saveEdit(u.id)}>Enregistrer</Button>
              <Button onClick={cancelEdit}>Annuler</Button>
            </>
          ) : (
            <Button onClick={() => startEdit(u)}>Modifier</Button>
          )
        }
      />
    </>
  )
}
