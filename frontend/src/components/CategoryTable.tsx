import { useState } from 'react'
import { validateCategory } from '../lib/categories'
import type { CategoryRead, CategoryUpdate } from '../types/api'
import { DataTable } from './DataTable'
import type { DataTableColumn } from './DataTable'
import { FormField } from './FormField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'

type CategoryTableProps = {
  categories: CategoryRead[]
  onUpdate: (id: number, data: CategoryUpdate) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
}

export function CategoryTable({ categories, onUpdate, onDelete }: CategoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editErrors, setEditErrors] = useState<string[]>([])

  function startEdit(category: CategoryRead) {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description ?? '')
    setEditErrors([])
  }

  function cancelEdit() {
    setEditingId(null)
    setEditErrors([])
  }

  async function saveEdit(id: number) {
    const data = {
      name: editName.trim(),
      description: editDescription.trim() === '' ? null : editDescription.trim(),
    }

    const found = validateCategory(data)
    setEditErrors(found)
    if (found.length > 0) return

    if (await onUpdate(id, data)) setEditingId(null)
  }

  async function handleDelete(category: CategoryRead) {
    if (window.confirm(`Supprimer la catégorie "${category.name}" ?`)) {
      await onDelete(category.id)
    }
  }

  const columns: DataTableColumn<CategoryRead>[] = [
    {
      header: 'Nom',
      render: (c) =>
        editingId === c.id ? <FormField id={`edit-name-${c.id}`} label="Nom" value={editName} onChange={setEditName} compact /> : <span className="font-semibold">{c.name}</span>,
    },
    {
      header: 'Description',
      render: (c) =>
        editingId === c.id ? (
          <FormField id={`edit-description-${c.id}`} label="Description" value={editDescription} onChange={setEditDescription} compact />
        ) : (
          <span className="text-ink-soft">{c.description}</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <ErrorList errors={editErrors} />
      <DataTable
        columns={columns}
        rows={categories}
        getRowId={(c) => c.id}
        renderActions={(c) =>
          editingId === c.id ? (
            <>
              <Button onClick={() => saveEdit(c.id)} variant="primary">
                Enregistrer
              </Button>
              <Button onClick={cancelEdit}>Annuler</Button>
            </>
          ) : (
            <>
              <Button onClick={() => startEdit(c)}>Modifier</Button>
              <Button onClick={() => handleDelete(c)} variant="danger">
                Supprimer
              </Button>
            </>
          )
        }
      />
    </div>
  )
}
