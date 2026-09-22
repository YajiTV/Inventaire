import type { ReactNode } from "react";

export interface DataTableColumn<T> {
    header: string;
    render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    rows: T[];
    getRowId: (row: T) => number | string;
    renderActions: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, getRowId, renderActions }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto rounded border dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.header} className="px-3 py-2 font-medium">
                                {column.header}
                            </th>
                        ))}
                        <th className="px-3 py-2 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={getRowId(row)} className="border-t dark:border-gray-700">
                            {columns.map((column) => (
                                <td key={column.header} className="px-3 py-2">
                                    {column.render(row)}
                                </td>
                            ))}
                            <td className="px-3 py-2">
                                <div className="flex gap-2">{renderActions(row)}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
