import { lineTotal } from '../lib/purchaseOrders'
import type { OrderLineRead, ProductRead } from '../types/api'
import { Ledger, Td, Th, Tr } from './Ledger'

type OrderLinesTableProps = {
  lines: OrderLineRead[]
  products: ProductRead[]
  total: string
}

export function OrderLinesTable({ lines, products, total }: OrderLinesTableProps) {
  if (lines.length === 0) {
    return (
      <p className="border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-ink-soft">
        Aucune ligne sur cette commande.
      </p>
    )
  }

  return (
    <Ledger>
      <thead>
        <tr>
          <Th>Produit</Th>
          <Th align="right">Quantité</Th>
          <Th align="right">Prix unitaire</Th>
          <Th align="right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <Tr key={line.id}>
            <Td>
              <span className="font-semibold">
                {products.find((product) => product.id === line.product_id)?.name ?? 'Produit supprimé'}
              </span>
            </Td>
            <Td align="right">{line.quantity}</Td>
            <Td align="right" muted>
              {Number(line.unit_price).toFixed(2)} €
            </Td>
            <Td align="right">{lineTotal(line).toFixed(2)} €</Td>
          </Tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-ink">
          <td colSpan={3} className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider font-stretch-condensed text-print">
            Total commande
          </td>
          <td className="px-3 py-3 text-right text-lg font-extrabold tabular-nums">{total} €</td>
        </tr>
      </tfoot>
    </Ledger>
  )
}
