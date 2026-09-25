interface ErrorListProps {
  errors: string[]
}

export function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) return null

  return (
    <ul className="flex w-full flex-col gap-1 border border-stamp/50 bg-rose/50 px-3 py-2 text-sm">
      {errors.map((error) => (
        <li key={error} role="alert">
          {error}
        </li>
      ))}
    </ul>
  )
}
