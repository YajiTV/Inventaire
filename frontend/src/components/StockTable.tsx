import type { StockRow } from '../lib/stocks'

type StockTableProps = {
  rows: StockRow[]
}

export function StockTable({ rows }: StockTableProps) {
  if (rows.length === 0) {
    return <p className="rounded border border-dashed p-6 text-center text-gray-600">Aucun stock ne correspond.</p>
  }

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Produit</th>
            <th className="px-3 py-2 font-medium">Emplacement</th>
            <th className="px-3 py-2 font-medium text-right">Quantité</th>
            <th className="px-3 py-2 font-medium text-right">Total produit</th>
            <th className="px-3 py-2 font-medium text-right">Seuil</th>
            <th className="px-3 py-2 font-medium">État</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="px-3 py-2">
                <div className="font-medium">{row.productName}</div>
                {row.productSku !== '' && <div className="text-xs text-gray-500">{row.productSku}</div>}
              </td>
              <td className="px-3 py-2">
                <div>{row.locationName}</div>
                {row.locationCode !== '' && <div className="text-xs text-gray-500">{row.locationCode}</div>}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{row.quantity}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-600">{row.totalQuantity}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-600">{row.reorderThreshold}</td>
              <td className="px-3 py-2">
                {row.belowThreshold ? (
                  <span className="text-xs text-red-700">Sous le seuil</span>
                ) : (
                  <span className="text-xs text-green-700">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
