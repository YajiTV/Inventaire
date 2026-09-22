import type { UserCreate } from '../types/api'

const FULL_NAME_MAX_LENGTH = 120
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateUserCreate(user: UserCreate): string[] {
  const errors: string[] = []
  const fullName = user.full_name.trim()

  if (!EMAIL_PATTERN.test(user.email)) {
    errors.push("L'email n'est pas valide.")
  }

  if (fullName.length === 0) {
    errors.push('Le nom complet est obligatoire.')
  } else if (fullName.length > FULL_NAME_MAX_LENGTH) {
    errors.push(`Le nom complet ne doit pas dépasser ${FULL_NAME_MAX_LENGTH} caractères.`)
  }

  if (user.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
  } else if (user.password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères.`)
  }

  return errors
}

export function validateFullName(fullName: string): string[] {
  const errors: string[] = []
  const trimmed = fullName.trim()

  if (trimmed.length === 0) {
    errors.push('Le nom complet est obligatoire.')
  } else if (trimmed.length > FULL_NAME_MAX_LENGTH) {
    errors.push(`Le nom complet ne doit pas dépasser ${FULL_NAME_MAX_LENGTH} caractères.`)
  }

  return errors
}

export function getInitials(fullName: string, email: string): string {
  return (fullName || email)
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}
