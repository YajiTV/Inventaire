import { Link } from 'react-router-dom'
import { StockTable } from '../components/StockTable'
import { useStocks } from '../hooks/useStocks'

export default function Stocks() {
  const { stocks, loading, error } = useStocks()

  return (
    <section className="p-8">
      <h1 className="text-xl font-semibold">Stocks</h1>
      <p>
        <Link to="/movements">Voir les mouvements</Link>
      </p>

      {loading && <p>Chargement des stocks...</p>}
      {error !== null && <p role="alert">{error}</p>}
      {!loading && error === null && <StockTable stocks={stocks} />}
    </section>
  )
}
