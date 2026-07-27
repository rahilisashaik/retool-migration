import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { ReactNode } from 'react'

interface TableColumn {
  key: string
  header: string
  className?: string
}

interface TableContainerProps {
  columns: TableColumn[]
  children: ReactNode
  className?: string
}

export function TableContainer({ columns, children, className = '' }: TableContainerProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-x-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  )
}
