import { useState } from 'react'
import type { PurchaseOrderRead, ReplenishmentSuggestion } from '../types/api'
import { validateTrigger } from '../lib/replenishment'

type ReplenishmentSupplierGroupProps = {
  supplierId: number
  suggestions: ReplenishmentSuggestion[]
  locationId: number | null
  onTrigger: (supplierId: number, productIds: number[], locationId: number) => Promise<PurchaseOrderRead>
}

export function ReplenishmentSupplierGroup({
  supplierId,
  suggestions,
  locationId,
  onTrigger,
}: ReplenishmentSupplierGroupProps) {
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [result, setResult] = useState<PurchaseOrderRead | null>(null)

  async function handleGenerate() {
    const found = validateTrigger(locationId)
    setErrors(found)
    setResult(null)

    if (found.length > 0 || locationId === null) return

    setPending(true)
    try {
      const order = await onTrigger(
        supplierId,
        suggestions.map((s) => s.product_id),
        locationId,
      )
      setResult(order)
    } catch (err) {
      setErrors([(err as Error).message])
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-6 border rounded p-4">
      <h2 className="font-semibold mb-2">Fournisseur #{supplierId}</h2>

      <table className="w-full border-collapse mb-2">
        <thead>
          <tr>
            <th className="text-left border-b p-2">Produit</th>
            <th className="text-left border-b p-2">Quantité actuelle</th>
            <th className="text-left border-b p-2">Seuil</th>
            <th className="text-left border-b p-2">Quantité suggérée</th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((s) => (
            <tr key={s.product_id}>
              <td className="p-2">{s.product_name}</td>
              <td className="p-2">{s.current_quantity}</td>
              <td className="p-2">{s.reorder_threshold}</td>
              <td className="p-2">{s.suggested_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={handleGenerate} disabled={pending} className="border rounded px-3 py-1">
        {pending ? 'Génération...' : 'Générer la commande'}
      </button>

      {errors.map((error) => (
        <p key={error} role="alert" className="text-red-600 text-sm mt-2">
          {error}
        </p>
      ))}

      {result !== null && (
        <p role="status" className="text-green-700 text-sm mt-2">
          Commande {result.reference} générée ({result.lines.length} ligne(s), total {result.total_price} €).
        </p>
      )}
    </div>
  )
}