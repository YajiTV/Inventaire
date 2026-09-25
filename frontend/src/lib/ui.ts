import type { MovementType } from '../types/api'

// Shared Tailwind class strings of the carbon-copy pad

const BUTTON_BASE =
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: `${BUTTON_BASE} bg-ink text-paper hover:bg-ink/85`,
  secondary: `${BUTTON_BASE} border border-rule-strong bg-paper text-ink hover:bg-paper-2`,
  danger: `${BUTTON_BASE} border border-rule-strong bg-paper text-stamp hover:bg-rose`,
}

export const FIELD_BOX =
  'flex flex-col border bg-paper transition-colors duration-150 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink'
export const FIELD_LABEL = 'px-2 pt-1.5 text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print'
export const FIELD_CONTROL =
  'w-full bg-transparent px-2 pb-1.5 pt-0.5 text-[15px] text-ink placeholder:text-print focus-visible:outline-none'

// Colour law of the pad: yellow copy = in, pink copy = out, blue copy = transfer
export const MOVEMENT_COPY: Record<MovementType, string> = {
  in: 'bg-canary',
  out: 'bg-rose',
  transfer: 'bg-sky',
}
