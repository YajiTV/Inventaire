import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useReplenishment } from '../hooks/useReplenishment'
import { useLocations } from '../hooks/useLocations'
import { groupBySupplier } from '../lib/replenishment'
import { ReplenishmentSupplierGroup } from '../components/ReplenishmentSupplierGroup'

export default function Replenishment() {
  const { suggestions, loading, error, triggerOrder } = useReplenishment()
  const { locations, loading: locationsLoading } = useLocations()
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
    <section className="p-8">
      <p>
        <Link to="/">← Retour</Link>
      </p>
      <h1 className="text-xl font-semibold mb-4">Réapprovisionnement</h1>

      <div className="mb-6">
        <label htmlFor="location" className="block mb-1">
          Emplacement de livraison
        </label>
        <select
          id="location"
          value={locationId ?? ''}
          onChange={(event) => setLocationId(event.target.value === '' ? null : Number(event.target.value))}
          className="border rounded px-2 py-1"
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
      {error !== null && <p role="alert">{error}</p>}

      {!loading && error === null && withSupplier.size === 0 && withoutSupplier.length === 0 && (
        <p>Aucun produit sous le seuil de réapprovisionnement.</p>
      )}

      {!loading &&
        error === null &&
        Array.from(withSupplier.entries()).map(([supplierId, group]) => (
          <ReplenishmentSupplierGroup
            key={supplierId}
            supplierId={supplierId}
            suggestions={group}
            locationId={locationId}
            onTrigger={handleTrigger}
          />
        ))}

      {withoutSupplier.length > 0 && (
        <div className="border rounded p-4 mt-4">
          <h2 className="font-semibold mb-2">Sans fournisseur assigné</h2>
          <p className="text-sm text-gray-600 mb-2">
            Ces produits sont sous le seuil mais n'ont pas de fournisseur associé : impossible de générer une
            commande automatiquement.
          </p>
          <ul className="list-disc list-inside">
            {withoutSupplier.map((s) => (
              <li key={s.product_id}>{s.product_name}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}