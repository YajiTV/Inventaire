import { useState } from 'react'
import { useReplenishment } from '../hooks/useReplenishment'
import { useLocations } from '../hooks/useLocations'
import { useSuppliers } from '../hooks/useSuppliers'
import { groupBySupplier } from '../lib/replenishment'
import { PageHeader } from '../components/PageHeader'
import { ReplenishmentSupplierGroup } from '../components/ReplenishmentSupplierGroup'
import { Section } from '../components/Section'
import { SelectField } from '../components/SelectField'
import { StatusMessage } from '../components/StatusMessage'

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
    <>
      <PageHeader title="Réapprovisionnement" />

      <div className="flex flex-col gap-6">
        <div className="max-w-sm">
          <SelectField
            id="location"
            label="Emplacement de livraison"
            value={locationId === null ? '' : String(locationId)}
            onChange={(value) => setLocationId(value === '' ? null : Number(value))}
            options={locations.map((location) => ({ value: location.id, label: `${location.name} (${location.code})` }))}
            placeholder="Choisir..."
            disabled={locationsLoading}
          />
        </div>

        <StatusMessage
          loading={loading}
          error={error}
          isEmpty={!loading && error === null && suggestions.length === 0}
          emptyMessage="Aucun produit sous le seuil de réapprovisionnement."
        />

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

        {!loading && error === null && withoutSupplier.length > 0 && (
          <Section title="Sans fournisseur assigné" shortage>
            <p className="mb-3 text-sm text-ink-soft">
              Associez un fournisseur à ces produits pour générer leur commande.
            </p>
            <ul className="text-sm">
              {withoutSupplier.map((s) => (
                <li key={s.product_id} className="border-b border-rule py-2 font-semibold last:border-b-0">
                  {s.product_name}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </>
  )
}
