import { sortMovements } from '../lib/stockMovements'
import type { LocationRead, ProductRead, StockMovementRead } from '../types/api'
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

const SIGN = { in: '+', out: '−', transfer: '' }

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

  return (
    <Ledger framed={framed}>
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Type</Th>
          <Th>Produit</Th>
          <Th>Emplacement</Th>
          <Th align="right">Quantité</Th>
        </tr>
      </thead>
      <tbody>
        {sortMovements(movements).map((movement) => {
          const product = productsById.get(movement.product_id)
          const date = new Date(movement.created_at)
          return (
            <Tr key={movement.id}>
              <Td muted>
                <span className="whitespace-nowrap">{date.toLocaleDateString('fr-FR')}</span>
                <span className="ml-2 text-xs">
                  {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Td>
              <Td>
                <span className="flex items-center gap-3">
                  <MovementTag type={movement.type} />
                  {movement.id === freshId && (
                    <Stamp tone="ink" fresh>
                      Nouveau
                    </Stamp>
                  )}
                </span>
              </Td>
              <Td>
                <span className="font-semibold">{product?.name ?? 'Produit supprimé'}</span>
                {product !== undefined && product.sku !== '' && (
                  <span className="ml-2 text-xs text-ink-soft">{product.sku}</span>
                )}
              </Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {movement.source_location_id !== null && <span>{locationName(movement.source_location_id)}</span>}
                  {movement.source_location_id !== null && movement.target_location_id !== null && (
                    <svg className="size-4 text-print" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" role="img" aria-label="vers">
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  )}
                  {movement.target_location_id !== null && <span>{locationName(movement.target_location_id)}</span>}
                </span>
              </Td>
              <Td align="right">
                <span className="text-base font-bold">
                  {SIGN[movement.type]}
                  {movement.quantity}
                </span>
              </Td>
            </Tr>
          )
        })}
      </tbody>
    </Ledger>
  )
}
