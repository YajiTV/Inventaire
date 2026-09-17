import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      // Le 409 « stock insuffisant » arrive ici avec son detail : on l'affiche tel quel.
      setServerError((err as Error).message)
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-xl font-semibold">Nouveau mouvement de stock</h1>
      {serverError !== null && <p role="alert">{serverError}</p>}
      <MovementForm onSubmit={handleSubmit} />
    </section>
  )
}
