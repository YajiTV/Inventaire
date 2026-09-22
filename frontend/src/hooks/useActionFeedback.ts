import { useState } from 'react'

export function useActionFeedback() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function run(action: () => Promise<unknown>, successMessage: string): Promise<boolean> {
    setError(null)
    setSuccess(null)
    try {
      await action()
      setSuccess(successMessage)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      return false
    }
  }

  function clear() {
    setError(null)
    setSuccess(null)
  }

  return { error, success, run, clear }
}
