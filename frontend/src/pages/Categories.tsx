import { CategoryForm } from '../components/CategoryForm'
import { CategoryTable } from '../components/CategoryTable'
import { StatusMessage } from '../components/StatusMessage'
import { ActionFeedback } from '../components/ActionFeedback'
import { useCategories } from '../hooks/useCategories'
import { useActionFeedback } from '../hooks/useActionFeedback'
import type { CategoryCreate, CategoryUpdate } from '../types/api'

export default function Categories() {
  const { categories, loading, error, addCategory, editCategory, removeCategory } = useCategories()
  const feedback = useActionFeedback()

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Catégories</h1>

      <CategoryForm
        onSubmit={(data: CategoryCreate) => feedback.run(() => addCategory(data), 'Catégorie ajoutée avec succès.')}
      />

      <StatusMessage
        loading={loading}
        error={error}
        isEmpty={!loading && !error && categories.length === 0}
        emptyMessage="Aucune catégorie"
      />
      <ActionFeedback error={feedback.error} success={feedback.success} />

      {!loading && !error && categories.length > 0 && (
        <CategoryTable
          categories={categories}
          onUpdate={(id: number, data: CategoryUpdate) =>
            feedback.run(() => editCategory(id, data), 'Catégorie modifiée avec succès.')
          }
          onDelete={(id: number) => feedback.run(() => removeCategory(id), 'Catégorie supprimée avec succès.')}
        />
      )}
    </section>
  )
}
