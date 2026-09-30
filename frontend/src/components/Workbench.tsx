import type { ReactNode } from 'react'
import { Section } from './Section'

interface WorkbenchProps {
  children: ReactNode
  formTitle: string
  form: ReactNode
  formOnTop?: boolean
}

export function Workbench({ children, formTitle, form, formOnTop = false }: WorkbenchProps) {
  if (formOnTop) {
    return (
      <div className="flex flex-col gap-6">
        <Section title={formTitle}>{form}</Section>
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
      <div className="xl:sticky xl:top-8">
        <Section title={formTitle}>{form}</Section>
      </div>
    </div>
  )
}
