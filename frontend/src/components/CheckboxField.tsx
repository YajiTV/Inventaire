interface CheckboxFieldProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({ id, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex h-full min-h-12 cursor-pointer items-center gap-2 border border-rule-strong bg-paper px-3 text-sm has-checked:bg-rose"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-ink"
      />
      {label}
    </label>
  )
}
