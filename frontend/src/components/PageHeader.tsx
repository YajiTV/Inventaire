import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  // Real identifier of the sheet (date, reference, SKU), printed in red top right
  serial?: string
  back?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, serial, back, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back && <div className="mb-3 text-sm">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-4">
        <h1 className="min-w-0 text-3xl leading-none font-extrabold uppercase tracking-tight text-balance font-stretch-condensed">
          {title}
        </h1>
        {(serial || actions) && (
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {serial && (
              <span className="text-lg leading-none font-bold tabular-nums font-stretch-condensed text-stamp">{serial}</span>
            )}
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
      <div className="perforation" />
    </header>
  )
}
