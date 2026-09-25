import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface AuthSheetProps {
  title: string
  children: ReactNode
}

// Sign-in pages: the pad's cover on the left, the sheet to fill on the right
export function AuthSheet({ title, children }: AuthSheetProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="flex items-center justify-between bg-cover px-4 py-3 text-cover-ink sm:px-8 lg:flex-col lg:items-start lg:justify-between lg:p-12">
        <Link to="/" className="text-xl font-extrabold uppercase tracking-tight font-stretch-condensed">
          Inventaire
        </Link>
        <p className="hidden max-w-sm text-5xl leading-[0.95] font-extrabold uppercase tracking-tight text-balance font-stretch-condensed text-white lg:block">
          Le carnet de stock du restaurant
        </p>
        <div className="flex gap-1.5 lg:gap-2" aria-hidden="true">
          <span className="h-3 w-6 bg-paper lg:h-4 lg:w-8" />
          <span className="h-3 w-6 bg-canary lg:h-4 lg:w-8" />
          <span className="h-3 w-6 bg-rose lg:h-4 lg:w-8" />
          <span className="h-3 w-6 bg-sky lg:h-4 lg:w-8" />
        </div>
      </aside>

      <main className="relative flex items-start justify-center px-4 py-10 sm:px-8 lg:items-center lg:py-12">
        <div className="absolute top-3 right-3 lg:top-6 lg:right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <h1 className="text-4xl leading-none font-extrabold uppercase tracking-tight font-stretch-condensed">{title}</h1>
          <div className="perforation mt-5 mb-6" />
          {children}
        </div>
      </main>
    </div>
  )
}
