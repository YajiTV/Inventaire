import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionFeedback } from '../components/ActionFeedback'
import { MovementForm } from '../components/MovementForm'
import { PageHeader } from '../components/PageHeader'
import { StatusMessage } from '../components/StatusMessage'
import { createMovement } from '../api/stockMovements'
import { useAllProducts } from '../hooks/useProducts'
import { useLocations } from '../hooks/useLocations'
import type { StockMovementCreate } from '../types/api'

export default function NewMovement() {
  const navigate = useNavigate()
  const { products, loading: productsLoading, error: productsError } = useAllProducts()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  const [serverError, setServerError] = useState<string | null>(null)

  const loading = productsLoading || locationsLoading
  const error = productsError ?? locationsError

  async function handleSubmit(movement: StockMovementCreate) {
    setServerError(null)
    try {
      const created = await createMovement(movement)
      navigate('/movements', { state: { freshId: created.id } })
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Bon de mouvement"
        back={
          <Link to="/movements" className="font-semibold hover:underline">
            Retour aux mouvements
          </Link>
        }
      />

      <div className="flex max-w-3xl flex-col gap-4">
        <ActionFeedback error={serverError} success={null} />
        <StatusMessage loading={loading} error={error} />
        {!loading && !error && <MovementForm products={products} locations={locations} onSubmit={handleSubmit} />}
      </div>
    </>
  )
}
