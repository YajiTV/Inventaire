import type { ReactNode } from 'react'

type Align = 'left' | 'right'

// Ruled table of the pad: printed header row, one rule per line.
// framed=false when the table already sits inside a bordered block.
export function Ledger({ children, framed = true }: { children: ReactNode; framed?: boolean }) {
  return (
    <div className={`relative overflow-x-auto ${framed ? 'border border-rule-strong' : ''}`}>
      <table className="w-full min-w-[36rem] border-collapse text-sm [&_tbody_tr:last-child_td]:border-b-0">{children}</table>
    </div>
  )
}

export function Th({ children, align = 'left' }: { children?: ReactNode; align?: Align }) {
  return (
    <th
      scope="col"
      className={`border-b border-rule-strong bg-paper-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap font-stretch-condensed text-print ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  )
}

export function Td({ children, align = 'left', muted = false }: { children?: ReactNode; align?: Align; muted?: boolean }) {
  return (
    <td
      className={`border-b border-rule px-3 py-2.5 align-middle ${align === 'right' ? 'text-right tabular-nums' : ''} ${muted ? 'text-ink-soft' : ''}`}
    >
      {children}
    </td>
  )
}

// shortage: the line is on the pink copy
export function Tr({ children, shortage = false }: { children: ReactNode; shortage?: boolean }) {
  return (
    <tr className={`transition-colors duration-150 ${shortage ? 'bg-rose/60' : 'hover:bg-paper-2'}`}>{children}</tr>
  )
}
