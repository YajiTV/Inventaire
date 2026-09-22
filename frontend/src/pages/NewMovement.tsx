import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MovementForm } from '../components/MovementForm'
import { createMovement } from '../api/stockMovements'
import type { StockMovementCreate } from '../types/api'

export default function NewMovement() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(movement: StockMovementCreate) {
    setServerError(null)
    try {
      await createMovement(movement)
      navigate('/movements')
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <section className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Nouveau mouvement de stock</h1>
        <div className="flex gap-4 text-sm">
          <Link to="/movements" className="underline">
            Retour aux mouvements
          </Link>
        </div>
      </div>

      {serverError !== null && (
        <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {serverError}
        </p>
      )}

      <MovementForm onSubmit={handleSubmit} />
    </section>
  )
}
