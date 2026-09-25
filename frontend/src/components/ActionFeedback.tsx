import { Stamp } from './Stamp'

interface ActionFeedbackProps {
  error: string | null
  success: string | null
}

export function ActionFeedback({ error, success }: ActionFeedbackProps) {
  if (error) {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 border border-stamp/50 bg-rose/50 px-3 py-2.5 text-sm">
        <Stamp>Refusé</Stamp>
        <span>{error}</span>
      </div>
    )
  }

  if (success) {
    return (
      <div role="status" className="flex flex-wrap items-center gap-3 border border-rule-strong bg-paper-2 px-3 py-2.5 text-sm">
        <Stamp tone="ink" fresh key={success}>
          Enregistré
        </Stamp>
        <span>{success}</span>
      </div>
    )
  }

  return null
}
