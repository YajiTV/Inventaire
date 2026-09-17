import { apiFetch } from '../lib/api'
import type { CategoryRead, CategoryCreate, CategoryUpdate } from '../types/api'

export async function fetchCategories(): Promise<CategoryRead[]> {
  const response = await apiFetch('/categories')
  return response.json()
}

export async function createCategory(data: CategoryCreate): Promise<CategoryRead> {
  const response = await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function updateCategory(id: number, data: CategoryUpdate): Promise<CategoryRead> {
  const response = await apiFetch(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function deleteCategory(id: number): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: 'DELETE' })
}
