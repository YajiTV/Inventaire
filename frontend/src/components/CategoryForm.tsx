import type { FormEvent } from 'react'
import { useState } from 'react'
import { validateCategory } from '../lib/categories'
import type { CategoryCreate } from '../types/api'

type CategoryFormProps = {
  onSubmit: (category: CategoryCreate) => void
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const category: CategoryCreate = {
      name: name.trim(),
      description: description.trim() === '' ? null : description.trim(),
    }

    const found = validateCategory(category)
    setErrors(found)

    if (found.length === 0) {
      onSubmit(category)
      setName('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="category-name" className="mb-1 block text-sm">
            Nom
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="category-description" className="mb-1 block text-sm">
            Description
          </label>
          <input
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <button type="submit" className="rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
          Ajouter
        </button>
      </div>

      {errors.map((error) => (
        <p key={error} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ))}
    </form>
  )
}