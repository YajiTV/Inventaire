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
    return <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">Aucune catégorie.</p>
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
    <div className="overflow-x-auto rounded border dark:border-gray-700">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 font-medium">Nom</th>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-t dark:border-gray-700">
              {editingId === category.id ? (
                <>
                  <td className="px-3 py-2">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="w-full min-w-32 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      className="w-full min-w-32 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(category.id)}
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
                  <td className="px-3 py-2 font-medium">{category.name}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{category.description}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        {editErrors.length > 0 && (
          <tfoot>
            <tr className="border-t dark:border-gray-700">
              <td colSpan={3} className="px-3 py-2">
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
