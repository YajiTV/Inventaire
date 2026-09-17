import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MovementsTable } from '../components/MovementsTable'
import { useStockMovements } from '../hooks/useStockMovements'
import { EMPTY_MOVEMENT_FILTERS } from '../api/stockMovements'

export default function Movements() {
  const [filters, setFilters] = useState(EMPTY_MOVEMENT_FILTERS)
  const { movements, loading, error } = useStockMovements(filters)

  return (
    <section className="p-8">
      <h1 className="text-xl font-semibold">Mouvements de stock</h1>
      <p>
        <Link to="/movements/new">Saisir un mouvement</Link> — <Link to="/stocks">Voir les stocks</Link>
      </p>

      <label htmlFor="filter-product">Produit</label>
      <input
        id="filter-product"
        value={filters.productId}
        onChange={(event) => setFilters({ ...filters, productId: event.target.value })}
      />

      <label htmlFor="filter-location">Emplacement</label>
      <input
        id="filter-location"
        value={filters.locationId}
        onChange={(event) => setFilters({ ...filters, locationId: event.target.value })}
      />

      <label htmlFor="filter-type">Type de mouvement</label>
      <select
        id="filter-type"
        value={filters.type}
        onChange={(event) => setFilters({ ...filters, type: event.target.value })}
      >
        <option value="">Tous</option>
        <option value="in">Entrée</option>
        <option value="out">Sortie</option>
        <option value="transfer">Transfert</option>
      </select>

      {loading && <p>Chargement des mouvements...</p>}
      {error !== null && <p role="alert">{error}</p>}
      {!loading && error === null && <MovementsTable movements={movements} />}
    </section>
  )
}
