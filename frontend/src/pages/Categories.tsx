import { CategoryForm } from '../components/CategoryForm'
import { CategoryTable } from '../components/CategoryTable'
import { StatusMessage } from '../components/StatusMessage'
import { ActionFeedback } from '../components/ActionFeedback'
import { PageHeader } from '../components/PageHeader'
import { Workbench } from '../components/Workbench'
import { useCategories } from '../hooks/useCategories'
import { useActionFeedback } from '../hooks/useActionFeedback'
import type { CategoryCreate, CategoryUpdate } from '../types/api'

export default function Categories() {
  const { categories, loading, error, addCategory, editCategory, removeCategory } = useCategories()
  const feedback = useActionFeedback()

  return (
    <>
      <PageHeader title="Catégories" />

      <Workbench
        formTitle="Nouvelle catégorie"
        form={
          <CategoryForm
            onSubmit={(data: CategoryCreate) => feedback.run(() => addCategory(data), 'Catégorie ajoutée avec succès.')}
          />
        }
      >
        <ActionFeedback error={feedback.error} success={feedback.success} />
        <StatusMessage
          loading={loading}
          error={error}
          isEmpty={!loading && !error && categories.length === 0}
          emptyMessage="Aucune catégorie. Ajoutez la première avec le formulaire."
        />

        {!loading && !error && categories.length > 0 && (
          <CategoryTable
            categories={categories}
            onUpdate={(id: number, data: CategoryUpdate) =>
              feedback.run(() => editCategory(id, data), 'Catégorie modifiée avec succès.')
            }
            onDelete={(id: number) => feedback.run(() => removeCategory(id), 'Catégorie supprimée avec succès.')}
          />
        )}
      </Workbench>
    </>
  )
}
