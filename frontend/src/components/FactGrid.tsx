import type { ReactNode } from 'react'

export interface Fact {
  label: string
  value: ReactNode
  wide?: boolean
  shortage?: boolean
}

const COLUMNS = {
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

// Pre-printed boxes of a form sheet: label in the corner, value below
export function FactGrid({ facts, columns = 4 }: { facts: Fact[]; columns?: 3 | 4 }) {
  return (
    <dl className={`grid grid-cols-1 border-t border-l border-rule-strong ${COLUMNS[columns]}`}>
      {facts.map((fact) => (
        <div
          key={fact.label}
          className={`border-r border-b border-rule-strong px-3 py-2.5 ${fact.wide ? 'col-span-full' : ''} ${fact.shortage ? 'bg-rose' : ''}`}
        >
          <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">{fact.label}</dt>
          <dd className="mt-1 text-lg font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
