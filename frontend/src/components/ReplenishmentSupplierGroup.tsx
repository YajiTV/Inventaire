import { useState } from 'react'
import type { PurchaseOrderRead, ReplenishmentSuggestion } from '../types/api'
import { validateTrigger } from '../lib/replenishment'

type ReplenishmentSupplierGroupProps = {
  supplierId: number
  supplierName: string
  suggestions: ReplenishmentSuggestion[]
  locationId: number | null
  onTrigger: (supplierId: number, productIds: number[], locationId: number) => Promise<PurchaseOrderRead>
}

export function ReplenishmentSupplierGroup({
  supplierId,
  supplierName,
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
    <div className="mb-6 rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 font-semibold">{supplierName}</h2>

      <div className="mb-3 overflow-x-auto rounded border dark:border-gray-700">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 font-medium">Produit</th>
              <th className="px-3 py-2 font-medium text-right">Quantité actuelle</th>
              <th className="px-3 py-2 font-medium text-right">Seuil</th>
              <th className="px-3 py-2 font-medium text-right">Quantité suggérée</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.product_id} className="border-t dark:border-gray-700">
                <td className="px-3 py-2 font-medium">{s.product_name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.current_quantity}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{s.reorder_threshold}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.suggested_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="rounded border px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:disabled:text-gray-600"
      >
        {pending ? 'Génération...' : 'Générer la commande'}
      </button>

      {errors.map((error) => (
        <p key={error} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ))}

      {result !== null && (
        <p role="status" className="mt-2 text-sm text-green-700 dark:text-green-400">
          Commande {result.reference} générée ({result.lines.length} ligne(s), total {result.total_price} €).
        </p>
      )}
    </div>
  )
}
