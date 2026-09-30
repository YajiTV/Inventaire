import { FIELD_BOX, FIELD_CONTROL, FIELD_LABEL } from '../lib/ui'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
  compact?: boolean
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  compact = false,
}: SelectFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className={`${FIELD_BOX} ${error ? 'border-stamp' : 'border-rule-strong'}`}>
        <label htmlFor={id} className={compact ? 'sr-only' : FIELD_LABEL}>
          {label}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${FIELD_CONTROL} bg-paper disabled:opacity-50 ${compact ? 'py-1.5' : ''}`}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-stamp">
          {error}
        </p>
      )}
    </div>
  )
}
