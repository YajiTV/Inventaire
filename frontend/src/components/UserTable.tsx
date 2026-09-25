import { useState } from 'react'
import { ROLE_OPTIONS, roleLabel, validateFullName } from '../lib/users'
import type { UserRead, UserRole, UserUpdate } from '../types/api'
import { DataTable } from './DataTable'
import type { DataTableColumn } from './DataTable'
import { FormField } from './FormField'
import { SelectField } from './SelectField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'
import { Stamp } from './Stamp'

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
    { header: 'Email', render: (u) => <span className="text-ink-soft">{u.email}</span> },
    {
      header: 'Nom complet',
      render: (u) =>
        editingId === u.id ? (
          <FormField id={`edit-full-name-${u.id}`} label="Nom complet" value={editFullName} onChange={setEditFullName} compact />
        ) : (
          <span className="font-semibold">{u.full_name}</span>
        ),
    },
    {
      header: 'Rôle',
      render: (u) =>
        editingId === u.id ? (
          <SelectField
            id={`edit-role-${u.id}`}
            label="Rôle"
            compact
            value={editRole}
            onChange={(value) => setEditRole(value as UserRole)}
            options={ROLE_OPTIONS}
          />
        ) : (
          <span
            className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider font-stretch-condensed ${u.role === 'admin' ? 'bg-ink text-paper' : 'border border-rule-strong'}`}
          >
            {roleLabel(u.role)}
          </span>
        ),
    },
    {
      header: 'Actif',
      render: (u) =>
        editingId === u.id ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(event) => setEditIsActive(event.target.checked)}
              className="size-4 accent-ink"
            />
            Actif
          </label>
        ) : u.is_active ? (
          'Oui'
        ) : (
          <Stamp>Inactif</Stamp>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <ErrorList errors={editErrors} />
      <DataTable
        columns={columns}
        rows={users}
        getRowId={(u) => u.id}
        renderActions={(u) =>
          editingId === u.id ? (
            <>
              <Button onClick={() => saveEdit(u.id)} variant="primary">
                Enregistrer
              </Button>
              <Button onClick={cancelEdit}>Annuler</Button>
            </>
          ) : (
            <Button onClick={() => startEdit(u)}>Modifier</Button>
          )
        }
      />
    </div>
  )
}
