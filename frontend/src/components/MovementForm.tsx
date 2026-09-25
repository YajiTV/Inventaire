import type { FormEvent } from 'react'
import { useState } from 'react'
import { validateMovement } from '../lib/stockMovements'
import type { LocationRead, MovementType, ProductRead, StockMovementCreate } from '../types/api'
import { Button } from './Button'
import { ErrorList } from './ErrorList'
import { FormField } from './FormField'
import { MOVEMENT_COPY } from '../lib/ui'
import { SelectField } from './SelectField'

type MovementFormProps = {
  products: ProductRead[]
  locations: LocationRead[]
  onSubmit: (movement: StockMovementCreate) => Promise<void>
}

// One carbon copy per movement type, in the colour of the pad
const TYPE_OPTIONS: { value: MovementType; label: string; hint: string }[] = [
  { value: 'in', label: 'Entrée', hint: 'Livraison reçue' },
  { value: 'out', label: 'Sortie', hint: 'Consommé ou jeté' },
  { value: 'transfer', label: 'Transfert', hint: "D'un emplacement à l'autre" },
]

export function MovementForm({ products, locations, onSubmit }: MovementFormProps) {
  const [type, setType] = useState<MovementType>('in')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))
  const locationOptions = locations.map((l) => ({ value: l.id, label: `${l.name} (${l.code})` }))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const movement: StockMovementCreate = {
      product_id: Number(productId),
      type,
      quantity: Number(quantity),
      source_location_id: type === 'in' || sourceId === '' ? null : Number(sourceId),
      target_location_id: type === 'out' || targetId === '' ? null : Number(targetId),
      reason: null,
    }

    const found = validateMovement(movement)
    setErrors(found)
    if (found.length > 0) return

    setSubmitting(true)
    await onSubmit(movement)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl border border-rule-strong">
      <div className={`h-2 transition-colors duration-200 ${MOVEMENT_COPY[type]}`} />

      <fieldset className="border-b border-rule-strong p-4">
        <legend className="sr-only">Type de mouvement</legend>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((option) => {
            const checked = type === option.value
            return (
              <label
                key={option.value}
                className={`cursor-pointer border px-3 py-2.5 transition-[background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.98] has-focus-visible:ring-2 has-focus-visible:ring-ink ${checked ? `border-ink ${MOVEMENT_COPY[option.value]}` : 'border-rule-strong bg-paper hover:bg-paper-2'}`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={checked}
                  onChange={() => setType(option.value)}
                  className="sr-only"
                />
                <span className="block text-base font-extrabold uppercase tracking-tight font-stretch-condensed">
                  {option.label}
                </span>
                <span className="hidden text-xs text-ink-soft sm:block">{option.hint}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <SelectField
          id="product"
          label="Produit"
          value={productId}
          onChange={setProductId}
          options={productOptions}
          placeholder="Choisir…"
        />
        <FormField id="quantity" label="Quantité" type="number" value={quantity} onChange={setQuantity} placeholder="30" />

        {type !== 'in' && (
          <SelectField
            id="source"
            label="Emplacement d'origine"
            value={sourceId}
            onChange={setSourceId}
            options={locationOptions}
            placeholder="Choisir…"
          />
        )}

        {type !== 'out' && (
          <SelectField
            id="target"
            label="Emplacement de destination"
            value={targetId}
            onChange={setTargetId}
            options={locationOptions}
            placeholder="Choisir…"
          />
        )}
      </div>

      {errors.length > 0 && (
        <div className="px-4 pb-4">
          <ErrorList errors={errors} />
        </div>
      )}

      <div className="flex justify-end border-t border-rule-strong bg-paper-2 px-4 py-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Enregistrement...' : 'Enregistrer le bon'}
        </Button>
      </div>
    </form>
  )
}
