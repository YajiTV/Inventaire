import type { InputHTMLAttributes } from 'react'
import { FIELD_BOX, FIELD_CONTROL, FIELD_LABEL } from '../lib/ui'

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  placeholder?: string
  required?: boolean
  // Inline edit inside a table row: the label stays for screen readers only
  compact?: boolean
}

export function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  compact = false,
}: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className={`${FIELD_BOX} ${error ? 'border-stamp' : 'border-rule-strong'}`}>
        <label htmlFor={id} className={compact ? 'sr-only' : FIELD_LABEL}>
          {label}
          {required && !compact && <span className="text-stamp"> *</span>}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={compact ? `${FIELD_CONTROL} py-1.5` : FIELD_CONTROL}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-stamp">
          {error}
        </p>
      )}
    </div>
  )
}
