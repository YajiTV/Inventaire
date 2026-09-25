import type { ReactNode } from 'react'
import { BUTTON_VARIANTS, type ButtonVariant } from '../lib/ui'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: ButtonVariant
}

export function Button({ children, onClick, type = 'button', disabled = false, variant = 'secondary' }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={BUTTON_VARIANTS[variant]}>
      {children}
    </button>
  )
}
