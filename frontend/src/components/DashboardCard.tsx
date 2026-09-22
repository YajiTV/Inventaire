import { Link } from 'react-router-dom'

interface DashboardCardProps {
  to: string
  label: string
  value: number
  loading?: boolean
  error?: string | null
  // Affiche le nombre en rouge quand la valeur demande une action (ex : produits sous le seuil)
  alert?: boolean
}

export function DashboardCard({ to, label, value, loading = false, error = null, alert = false }: DashboardCardProps) {
  let display: string
  if (error) {
    display = '—'
  } else if (loading) {
    display = '…'
  } else {
    display = String(value)
  }

  const valueColor = alert && !loading && !error && value > 0 ? 'text-red-600 dark:text-red-400' : ''

  return (
    <Link
      to={to}
      title={error ?? undefined}
      className="flex flex-col gap-1 rounded-xl border bg-white p-4 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <span className={`text-3xl font-semibold tabular-nums ${valueColor}`}>{display}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </Link>
  )
}
