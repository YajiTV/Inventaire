import { CategoryForm } from '../components/CategoryForm'
import { CategoryTable } from '../components/CategoryTable'
import { useCategories } from '../hooks/useCategories'

export default function Categories() {
  const { categories, loading, error, addCategory, editCategory, removeCategory } = useCategories()

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Catégories</h1>

      <CategoryForm onSubmit={addCategory} />

      {loading && <p>Chargement des catégories...</p>}
      {!loading && error !== null && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      {!loading && error === null && (
        <CategoryTable categories={categories} onUpdate={editCategory} onDelete={removeCategory} />
      )}
    </section>
  )
}
