import { useState } from 'react'
import { validateCategory } from '../lib/categories'
import type { CategoryRead, CategoryUpdate } from '../types/api'

type CategoryTableProps = {
  categories: CategoryRead[]
  onUpdate: (id: number, data: CategoryUpdate) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function CategoryTable({ categories, onUpdate, onDelete }: CategoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editErrors, setEditErrors] = useState<string[]>([])

  if (categories.length === 0) {
    return <p>Aucune catégorie</p>
  }

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
    const data: CategoryUpdate = {
      name: editName.trim(),
      description: editDescription.trim() === '' ? null : editDescription.trim(),
    }

    const found = validateCategory({ name: data.name ?? '', description: data.description })
    setEditErrors(found)

    if (found.length === 0) {
      await onUpdate(id, data)
      setEditingId(null)
    }
  }

  async function handleDelete(category: CategoryRead) {
    const confirmed = window.confirm(`Supprimer la catégorie "${category.name}" ?`)
    if (confirmed) {
      await onDelete(category.id)
    }
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left border-b p-2">Nom</th>
          <th className="text-left border-b p-2">Description</th>
          <th className="border-b p-2"></th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            {editingId === category.id ? (
              <>
                <td className="p-2">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => saveEdit(category.id)} className="border rounded px-2 py-1">
                    Enregistrer
                  </button>
                  <button onClick={cancelEdit} className="border rounded px-2 py-1">
                    Annuler
                  </button>
                </td>
              </>
            ) : (
              <>
                <td className="p-2">{category.name}</td>
                <td className="p-2">{category.description}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => startEdit(category)} className="border rounded px-2 py-1">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(category)} className="border rounded px-2 py-1">
                    Supprimer
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
            <td colSpan={3}>
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