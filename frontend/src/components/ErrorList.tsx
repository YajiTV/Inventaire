interface ErrorListProps {
  errors: string[]
}

export function ErrorList({ errors }: ErrorListProps) {
  return (
    <>
      {errors.map((error) => (
        <p key={error} role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ))}
    </>
  )
}
