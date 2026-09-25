import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  // Real identifier of the sheet (date, reference, SKU), printed in red top right
  serial?: string
  subtitle?: string
  back?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, serial, subtitle, back, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back && <div className="mb-3 text-sm">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-4">
        <div className="min-w-0">
          {subtitle && <p className="mb-2 text-sm text-ink-soft">{subtitle}</p>}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-3xl leading-none font-extrabold uppercase tracking-tight text-balance font-stretch-condensed">
            {title}
          </h1>
          {serial && (
            <span className="text-lg leading-none font-bold tabular-nums font-stretch-condensed text-stamp">{serial}</span>
          )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="perforation" />
    </header>
  )
}
