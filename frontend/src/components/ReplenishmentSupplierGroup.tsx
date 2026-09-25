import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PurchaseOrderRead, ReplenishmentSuggestion } from '../types/api'
import { validateTrigger } from '../lib/replenishment'
import { Button } from './Button'
import { ErrorList } from './ErrorList'
import { Ledger, Td, Th, Tr } from './Ledger'
import { Stamp } from './Stamp'
import { formatMoney, formatQuantity } from '../lib/format'

type ReplenishmentSupplierGroupProps = {
  supplierId: number
  supplierName: string
  suggestions: ReplenishmentSuggestion[]
  locationId: number | null
  onTrigger: (supplierId: number, productIds: number[], locationId: number) => Promise<PurchaseOrderRead>
}

// A draft purchase order for one supplier, stamped once generated
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
    <section className="border border-rule-strong">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-strong bg-paper-2 px-4 py-3">
        <h2 className="text-lg leading-tight font-extrabold uppercase tracking-tight font-stretch-condensed">{supplierName}</h2>
        {result === null ? (
          <Button variant="primary" onClick={handleGenerate} disabled={pending}>
            {pending ? 'Génération...' : 'Générer la commande'}
          </Button>
        ) : (
          <Stamp fresh>Commande générée</Stamp>
        )}
      </div>

      <Ledger framed={false}>
        <thead>
          <tr>
            <Th>Produit</Th>
            <Th align="right">Quantité actuelle</Th>
            <Th align="right">Seuil</Th>
            <Th align="right">À commander</Th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((s) => (
            <Tr key={s.product_id} shortage={result === null}>
              <Td>
                <span className="font-semibold">{s.product_name}</span>
              </Td>
              <Td align="right">{formatQuantity(s.current_quantity)}</Td>
              <Td align="right" muted>
                {formatQuantity(s.reorder_threshold)}
              </Td>
              <Td align="right">
                <span className="text-base font-bold">{formatQuantity(s.suggested_quantity)}</span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Ledger>

      {errors.length > 0 && (
        <div className="p-3">
          <ErrorList errors={errors} />
        </div>
      )}

      {result !== null && (
        <p role="status" className="flex flex-wrap items-center gap-x-2 border-t border-rule-strong px-4 py-3 text-sm">
          <Link to={`/orders/${result.id}`} className="font-bold text-stamp underline">
            {result.reference}
          </Link>
          <span className="text-ink-soft">
            {result.lines.length} ligne(s), total {formatMoney(result.total_price)}
          </span>
        </p>
      )}
    </section>
  )
}
