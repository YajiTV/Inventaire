import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  action?: ReactNode
  shortage?: boolean
  // flush: no inner padding, for a table that fills the block
  flush?: boolean
  children: ReactNode
}

// A printed block of the form: label strip on top, content below
export function Section({ title, action, shortage = false, flush = false, children }: SectionProps) {
  return (
    <section className="min-w-0 border border-rule-strong">
      <div
        className={`flex items-center justify-between gap-3 border-b border-rule-strong px-3 py-2 ${shortage ? 'bg-rose' : 'bg-paper-2'}`}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider font-stretch-condensed text-print">{title}</h2>
        {action}
      </div>
      <div className={flush ? '' : 'p-3'}>{children}</div>
    </section>
  )
}
