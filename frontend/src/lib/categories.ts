import type { CategoryCreate } from '../types/api'

const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 500

// Reprend exactement les contraintes du schema Pydantic CategoryBase
// (backend/app/schemas/category.py) pour eviter un 422 evitable.
export function validateCategory(category: CategoryCreate): string[] {
  const errors: string[] = []
  const name = category.name.trim()

  if (name.length === 0) {
    errors.push('Le nom est obligatoire.')
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.push(`Le nom ne doit pas dépasser ${NAME_MAX_LENGTH} caractères.`)
  }

  if (category.description != null && category.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push(`La description ne doit pas dépasser ${DESCRIPTION_MAX_LENGTH} caractères.`)
  }

  return errors
}
