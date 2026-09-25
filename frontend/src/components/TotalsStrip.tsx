import { Link } from 'react-router-dom'

export interface Total {
  label: string
  value: number
  to?: string
  loading?: boolean
  error?: string | null
  shortage?: boolean
}

// The totals line at the top of a sheet: one printed box per figure
export function TotalsStrip({ totals }: { totals: Total[] }) {
  return (
    <dl className="grid grid-cols-2 border-t border-l border-rule-strong max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
      {totals.map((total) => {
        const highlighted = total.shortage === true && !total.loading && !total.error && total.value > 0
        const content = (
          <>
            <dt className="text-[11px] font-semibold uppercase tracking-wider font-stretch-condensed text-print">
              {total.label}
            </dt>
            <dd className="mt-1 text-3xl leading-none font-extrabold tabular-nums">
              {total.error ? '—' : total.loading ? <span className="text-rule-strong">…</span> : total.value}
            </dd>
          </>
        )
        const box = `block border-r border-b border-rule-strong px-3 py-3 ${highlighted ? 'bg-rose' : 'bg-paper'}`

        return total.to ? (
          <Link
            key={total.label}
            to={total.to}
            title={total.error ?? undefined}
            className={`${box} transition-colors duration-150 ${highlighted ? '' : 'hover:bg-paper-2'}`}
          >
            {content}
          </Link>
        ) : (
          <div key={total.label} className={box}>
            {content}
          </div>
        )
      })}
    </dl>
  )
}
