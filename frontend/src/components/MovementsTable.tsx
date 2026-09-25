import { formatQuantity, slipNumber } from '../lib/format'
import { sortMovements } from '../lib/stockMovements'
import type { LocationRead, MovementType, ProductRead, StockMovementRead } from '../types/api'
import { Ledger, Td, Th, Tr } from './Ledger'
import { MovementTag } from './MovementTag'
import { Stamp } from './Stamp'

type MovementsTableProps = {
  movements: StockMovementRead[]
  products: ProductRead[]
  locations: LocationRead[]
  // Movement just recorded by the user, stamped in the list
  freshId?: number
  framed?: boolean
}

const SIGN: Record<MovementType, string> = { in: '+', out: '−', transfer: '' }

export function MovementsTable({ movements, products, locations, freshId, framed = true }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <p className="border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-ink-soft">
        Aucun mouvement ne correspond.
      </p>
    )
  }

  const productsById = new Map(products.map((product) => [product.id, product]))
  const locationName = (id: number | null) => locations.find((location) => location.id === id)?.name ?? ''

  const rows = sortMovements(movements).map((movement) => {
    const date = new Date(movement.created_at)
    return {
      movement,
      product: productsById.get(movement.product_id),
      day: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      quantity: `${SIGN[movement.type]}${formatQuantity(movement.quantity)}`,
    }
  })

  const route = (movement: StockMovementRead) => (
    <span className="flex items-center gap-2 whitespace-nowrap">
      {movement.source_location_id !== null && <span>{locationName(movement.source_location_id)}</span>}
      {movement.source_location_id !== null && movement.target_location_id !== null && (
        <svg className="size-4 text-print" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" role="img" aria-label="vers">
          <path d="M2 8h11M9 4l4 4-4 4" />
        </svg>
      )}
      {movement.target_location_id !== null && <span>{locationName(movement.target_location_id)}</span>}
    </span>
  )

  const freshStamp = (id: number) =>
    id === freshId && (
      <Stamp tone="ink" fresh>
        Nouveau
      </Stamp>
    )

  return (
    <>
      {/* Phones: one slip per line, product and quantity first */}
      <ul className={`sm:hidden ${framed ? 'border border-rule-strong' : ''}`}>
        {rows.map(({ movement, product, day, time, quantity }) => (
          <li key={movement.id} className="border-b border-rule px-3 py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{product?.name ?? 'Produit supprimé'}</span>
              <span className="text-lg font-bold tabular-nums">{quantity}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
              <MovementTag type={movement.type} />
              {route(movement)}
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-soft">
              <span className="font-bold font-stretch-condensed text-stamp">{slipNumber(movement.id)}</span>
              <span>
                {day} {time}
              </span>
              {freshStamp(movement.id)}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block">
        <Ledger framed={framed}>
          <thead>
            <tr>
              <Th>N°</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Produit</Th>
              <Th>Emplacement</Th>
              <Th align="right">Quantité</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ movement, product, day, time, quantity }) => (
              <Tr key={movement.id}>
                <Td>
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <span className="font-bold font-stretch-condensed text-stamp">{slipNumber(movement.id)}</span>
                    {freshStamp(movement.id)}
                  </span>
                </Td>
                <Td muted>
                  <span className="whitespace-nowrap">{day}</span>
                  <span className="ml-2 text-xs">{time}</span>
                </Td>
                <Td>
                  <MovementTag type={movement.type} />
                </Td>
                <Td>
                  <span className="font-semibold">{product?.name ?? 'Produit supprimé'}</span>
                  {product !== undefined && product.sku !== '' && (
                    <span className="ml-2 text-xs whitespace-nowrap text-ink-soft">{product.sku}</span>
                  )}
                </Td>
                <Td>{route(movement)}</Td>
                <Td align="right">
                  <span className="text-base font-bold whitespace-nowrap">{quantity}</span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Ledger>
      </div>
    </>
  )
}
