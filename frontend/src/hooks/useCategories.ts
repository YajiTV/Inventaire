import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import { useCrudList } from './useCrudList'

export function useCategories() {
  const { items, loading, error, add, edit, remove } = useCrudList({
    fetchAll: fetchCategories,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  })

  return { categories: items, loading, error, addCategory: add, editCategory: edit, removeCategory: remove }
}
