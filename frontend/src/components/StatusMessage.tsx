import { Stamp } from './Stamp'

interface StatusMessageProps {
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyMessage?: string
}

export function StatusMessage({ loading, error, isEmpty, emptyMessage = 'Aucun élément' }: StatusMessageProps) {
  if (loading) {
    // Blank ruled lines while the sheet fills in
    return (
      <div role="status" className="border border-rule-strong">
        <span className="sr-only">Chargement...</span>
        {[40, 65, 50, 30].map((width) => (
          <div key={width} className="flex h-10 items-center border-b border-rule px-3 last:border-b-0">
            <div className="h-2.5 animate-pulse bg-rule" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 border border-stamp/50 bg-rose/50 px-3 py-3 text-sm">
        <Stamp>Erreur</Stamp>
        <span>{error}</span>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <p className="border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-ink-soft">{emptyMessage}</p>
    )
  }

  return null
}
