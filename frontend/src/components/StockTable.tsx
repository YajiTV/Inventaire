import { formatQuantity } from '../lib/format'
import type { StockRow } from '../lib/stocks'
import { Ledger, Td, Th, Tr } from './Ledger'
import { Stamp } from './Stamp'

type StockTableProps = {
  rows: StockRow[]
}

export function StockTable({ rows }: StockTableProps) {
  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-ink-soft">
        Aucun stock ne correspond.
      </p>
    )
  }

  return (
    <>
      {/* Phones: product and quantity first, the rest on the line below */}
      <ul className="border border-rule-strong sm:hidden">
        {rows.map((row) => (
          <li key={row.id} className={`border-b border-rule px-3 py-3 last:border-b-0 ${row.belowThreshold ? 'bg-rose/60' : ''}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{row.productName}</span>
              <span className="text-lg font-bold tabular-nums">{formatQuantity(row.quantity)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-sm text-ink-soft">
              <span>
                {row.locationName}, seuil {formatQuantity(row.reorderThreshold)}
              </span>
              {row.belowThreshold && <Stamp>Sous le seuil</Stamp>}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block">
        <Ledger>
          <thead>
            <tr>
              <Th>Produit</Th>
              <Th>Emplacement</Th>
              <Th align="right">Quantité</Th>
              <Th align="right">Total produit</Th>
              <Th align="right">Seuil</Th>
              <Th>État</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Tr key={row.id} shortage={row.belowThreshold}>
                <Td>
                  <div className="font-semibold">{row.productName}</div>
                  {row.productSku !== '' && <div className="text-xs text-ink-soft">{row.productSku}</div>}
                </Td>
                <Td>
                  <div>{row.locationName}</div>
                  {row.locationCode !== '' && <div className="text-xs text-ink-soft">{row.locationCode}</div>}
                </Td>
                <Td align="right">
                  <span className="text-base font-bold">{formatQuantity(row.quantity)}</span>
                </Td>
                <Td align="right" muted>
                  {formatQuantity(row.totalQuantity)}
                </Td>
                <Td align="right" muted>
                  {formatQuantity(row.reorderThreshold)}
                </Td>
                <Td>{row.belowThreshold ? <Stamp>Sous le seuil</Stamp> : <span className="text-ink-soft">OK</span>}</Td>
              </Tr>
            ))}
          </tbody>
        </Ledger>
      </div>
    </>
  )
}
