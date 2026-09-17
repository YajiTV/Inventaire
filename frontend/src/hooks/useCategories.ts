import { useEffect, useState } from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import type { CategoryCreate, CategoryRead, CategoryUpdate } from '../types/api'

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchCategories()
      .then((data) => {
        if (cancelled) return
        setCategories(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function addCategory(data: CategoryCreate) {
    const created = await createCategory(data)
    setCategories((prev) => [...prev, created])
  }

  async function editCategory(id: number, data: CategoryUpdate) {
    const updated = await updateCategory(id, data)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function removeCategory(id: number) {
    await deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return { categories, loading, error, addCategory, editCategory, removeCategory }
}