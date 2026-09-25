import type { ReactNode } from 'react'

interface StampProps {
  children: ReactNode
  tone?: 'red' | 'ink'
  // Slam the stamp down once, for something the user just created
  fresh?: boolean
}

export function Stamp({ children, tone = 'red', fresh = false }: StampProps) {
  const color = tone === 'red' ? 'text-stamp' : 'text-ink'

  return (
    <span
      className={`inline-block -rotate-3 border-2 border-current px-1.5 py-px text-[11px] leading-4 font-extrabold uppercase tracking-widest whitespace-nowrap font-stretch-condensed ${color} ${fresh ? 'animate-stamp' : ''}`}
    >
      {children}
    </span>
  )
}
