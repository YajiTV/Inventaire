interface ActionFeedbackProps {
  error: string | null
  success: string | null
}

export function ActionFeedback({ error, success }: ActionFeedbackProps) {
  if (error) {
    return (
      <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        {error}
      </p>
    )
  }

  if (success) {
    return (
      <p role="status" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
        {success}
      </p>
    )
  }

  return null
}
