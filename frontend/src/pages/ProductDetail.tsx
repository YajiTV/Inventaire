import { Link, useParams } from 'react-router-dom'
import { FactGrid } from '../components/FactGrid'
import { PageHeader } from '../components/PageHeader'
import { Stamp } from '../components/Stamp'
import { StatusMessage } from '../components/StatusMessage'
import { useProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useSuppliers } from '../hooks/useSuppliers'
import { formatMoney, formatQuantity } from '../lib/format'

export default function ProductDetail() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(Number(id))

  const { categories } = useCategories()
  const { suppliers } = useSuppliers()

  const category = categories.find((c) => c.id === product?.category_id)
  const supplier = suppliers.find((f) => f.id === product?.supplier_id)
  const shortage = product !== null && product.total_quantity <= product.reorder_threshold

  return (
    <>
      <PageHeader
        title={product !== null ? product.name : 'Fiche produit'}
        serial={product?.sku}
        back={
          <Link to="/products" className="font-semibold hover:underline">
            Retour aux produits
          </Link>
        }
      />

      <StatusMessage loading={loading} error={error} />

      {!loading && error === null && product !== null && (
        <FactGrid
          columns={3}
          facts={[
            {
              label: 'Stock total',
              shortage,
              value: (
                <span className="flex items-center gap-3">
                  <span className="text-3xl leading-none font-extrabold">{formatQuantity(product.total_quantity)}</span>
                  {shortage && <Stamp>Sous le seuil</Stamp>}
                </span>
              ),
            },
            { label: 'Seuil de réapprovisionnement', value: formatQuantity(product.reorder_threshold) },
            { label: 'Prix unitaire', value: formatMoney(product.unit_price) },
            { label: 'Code-barres', value: product.barcode ?? <span className="text-ink-soft">Non renseigné</span> },
            { label: 'Catégorie', value: category?.name ?? <span className="text-ink-soft">Inconnue</span> },
            { label: 'Fournisseur', value: supplier?.name ?? <span className="text-ink-soft">Aucun</span> },
            {
              label: 'Description',
              wide: true,
              value: product.description ?? <span className="text-ink-soft">Aucune description</span>,
            },
          ]}
        />
      )}
    </>
  )
}
