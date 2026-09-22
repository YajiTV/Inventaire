import type { LocationCreate } from '../types/api'

const CODE_PATTERN = /^[A-Z0-9-]+$/
const CODE_MAX_LENGTH = 20
const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 500

export function validateLocation(location: LocationCreate): string[] {
  const errors: string[] = []
  const code = location.code.trim()
  const name = location.name.trim()

  if (code.length === 0) {
    errors.push('Le code est obligatoire.')
  } else if (code.length > CODE_MAX_LENGTH) {
    errors.push(`Le code ne doit pas dépasser ${CODE_MAX_LENGTH} caractères.`)
  } else if (!CODE_PATTERN.test(code)) {
    errors.push('Le code ne doit contenir que des majuscules, chiffres et tirets (ex : RESERVE-01).')
  }

  if (name.length === 0) {
    errors.push('Le nom est obligatoire.')
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.push(`Le nom ne doit pas dépasser ${NAME_MAX_LENGTH} caractères.`)
  }

  if (location.description != null && location.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push(`La description ne doit pas dépasser ${DESCRIPTION_MAX_LENGTH} caractères.`)
  }

  return errors
}