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
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
      <div className="flex flex-col">
        <label htmlFor="category-name">Nom</label>
        <input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="category-description">Description</label>
        <input
          id="category-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <button type="submit" className="self-end border rounded px-3 py-1">
        Ajouter
      </button>

      {errors.map((error) => (
        <p key={error} role="alert" className="w-full text-red-600 text-sm">
          {error}
        </p>
      ))}
    </form>
  )
}