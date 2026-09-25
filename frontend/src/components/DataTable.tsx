import type { ReactNode } from 'react'
import { Ledger, Td, Th, Tr } from './Ledger'

export interface DataTableColumn<T> {
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => number | string
  renderActions: (row: T) => ReactNode
  isShortage?: (row: T) => boolean
}

export function DataTable<T>({ columns, rows, getRowId, renderActions, isShortage }: DataTableProps<T>) {
  return (
    <Ledger>
      <thead>
        <tr>
          {columns.map((column) => (
            <Th key={column.header} align={column.align}>
              {column.header}
            </Th>
          ))}
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <Tr key={getRowId(row)} shortage={isShortage?.(row)}>
            {columns.map((column) => (
              <Td key={column.header} align={column.align}>
                {column.render(row)}
              </Td>
            ))}
            <Td align="right">
              <div className="flex justify-end gap-2">{renderActions(row)}</div>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Ledger>
  )
}
