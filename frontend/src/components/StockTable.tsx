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
              <span className="text-base font-bold">{row.quantity}</span>
            </Td>
            <Td align="right" muted>
              {row.totalQuantity}
            </Td>
            <Td align="right" muted>
              {row.reorderThreshold}
            </Td>
            <Td>{row.belowThreshold ? <Stamp>Sous le seuil</Stamp> : <span className="text-ink-soft">OK</span>}</Td>
          </Tr>
        ))}
      </tbody>
    </Ledger>
  )
}
