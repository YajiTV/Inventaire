import { Link } from 'react-router-dom'
import { CategoryForm } from '../components/CategoryForm'
import { CategoryTable } from '../components/CategoryTable'
import { useCategories } from '../hooks/useCategories'

export default function Categories() {
  const { categories, loading, error, addCategory, editCategory, removeCategory } = useCategories()

  return (
    <section className="p-8">
      <p>
        <Link to="/">← Retour</Link>
      </p>
      <h1 className="text-xl font-semibold mb-4">Catégories</h1>

      <CategoryForm onSubmit={addCategory} />

      {loading && <p>Chargement des catégories...</p>}
      {error !== null && <p role="alert">{error}</p>}
      {!loading && error === null && (
        <CategoryTable categories={categories} onUpdate={editCategory} onDelete={removeCategory} />
      )}
    </section>
  )
}