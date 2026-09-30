import type { FormEvent } from 'react'
import { useState } from 'react'
import { validateCategory } from '../lib/categories'
import type { CategoryCreate } from '../types/api'
import { FormField } from './FormField'
import { ErrorList } from './ErrorList'
import { Button } from './Button'

type CategoryFormProps = {
  onSubmit: (category: CategoryCreate) => Promise<boolean>
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const category: CategoryCreate = {
      name: name.trim(),
      description: description.trim() === '' ? null : description.trim(),
    }

    const found = validateCategory(category)
    setErrors(found)
    if (found.length > 0) return

    if (await onSubmit(category)) {
      setName('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <FormField id="category-name" label="Nom" value={name} onChange={setName} placeholder="Surgelés" required />
      <FormField id="category-description" label="Description" value={description} onChange={setDescription} placeholder="Viandes et frites" />
      <ErrorList errors={errors} />
      <Button type="submit" variant="primary">
        Ajouter la catégorie
      </Button>
    </form>
  )
}
