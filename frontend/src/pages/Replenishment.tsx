import { useState } from 'react'
import { useReplenishment } from '../hooks/useReplenishment'
import { useLocations } from '../hooks/useLocations'
import { useSuppliers } from '../hooks/useSuppliers'
import { groupBySupplier } from '../lib/replenishment'
import { ReplenishmentSupplierGroup } from '../components/ReplenishmentSupplierGroup'

export default function Replenishment() {
  const { suggestions, loading, error, triggerOrder } = useReplenishment()
  const { locations, loading: locationsLoading } = useLocations()
  const { suppliers } = useSuppliers()
  const [locationId, setLocationId] = useState<number | null>(null)

  const { withSupplier, withoutSupplier } = groupBySupplier(suggestions)

  async function handleTrigger(supplierId: number, productIds: number[], selectedLocationId: number) {
    return triggerOrder({
      supplier_id: supplierId,
      location_id: selectedLocationId,
      product_ids: productIds,
    })
  }

  return (
    <section className="p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Réapprovisionnement</h1>

      <div className="mb-6 max-w-sm">
        <label htmlFor="location" className="mb-1 block text-sm">
          Emplacement de livraison
        </label>
        <select
          id="location"
          value={locationId ?? ''}
          onChange={(event) => setLocationId(event.target.value === '' ? null : Number(event.target.value))}
          className="w-full rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
          disabled={locationsLoading}
        >
          <option value="">Choisir...</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} ({location.code})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Chargement des suggestions...</p>}
      {!loading && error !== null && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && error === null && withSupplier.size === 0 && withoutSupplier.length === 0 && (
        <p className="rounded border border-dashed p-6 text-center text-gray-600 dark:border-gray-600 dark:text-gray-400">
          Aucun produit sous le seuil de réapprovisionnement.
        </p>
      )}

      {!loading &&
        error === null &&
        Array.from(withSupplier.entries()).map(([supplierId, group]) => (
          <ReplenishmentSupplierGroup
            key={supplierId}
            supplierId={supplierId}
            supplierName={suppliers.find((s) => s.id === supplierId)?.name ?? 'Fournisseur'}
            suggestions={group}
            locationId={locationId}
            onTrigger={handleTrigger}
          />
        ))}

      {withoutSupplier.length > 0 && (
        <div className="mt-4 rounded border p-4 dark:border-gray-700">
          <h2 className="mb-2 font-semibold">Sans fournisseur assigné</h2>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Ces produits sont sous le seuil mais n'ont pas de fournisseur associé : impossible de générer une
            commande automatiquement.
          </p>
          <ul className="list-inside list-disc text-sm">
            {withoutSupplier.map((s) => (
              <li key={s.product_id}>{s.product_name}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}