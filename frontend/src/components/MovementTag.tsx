import { movementLabel } from '../lib/stockMovements'
import { MOVEMENT_COPY } from '../lib/ui'
import type { MovementType } from '../types/api'

export function MovementTag({ type }: { type: MovementType }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider font-stretch-condensed text-ink ${MOVEMENT_COPY[type]}`}
    >
      {movementLabel(type)}
    </span>
  )
}
