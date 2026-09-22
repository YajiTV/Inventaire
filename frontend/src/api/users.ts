import { apiFetch } from '../lib/api'
import type { UserCreate, UserRead, UserUpdate } from '../types/api'

export async function fetchUsers(): Promise<UserRead[]> {
  const response = await apiFetch('/users')
  return response.json()
}

export async function createUser(data: UserCreate): Promise<UserRead> {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function updateUser(id: number, data: UserUpdate): Promise<UserRead> {
  const response = await apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch(`/users/${id}`, { method: 'DELETE' })
}
