import { Link } from 'react-router-dom'

interface DashboardCardProps {
  to: string
  label: string
  value: number
  loading?: boolean
  error?: string | null
}

export function DashboardCard({ to, label, value, loading = false, error = null }: DashboardCardProps) {
  let display: string
  if (error) {
    display = '—'
  } else if (loading) {
    display = '…'
  } else {
    display = String(value)
  }

  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-white p-4 text-center">
      <span className="text-2xl font-semibold">{display}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </Link>
  )
}
