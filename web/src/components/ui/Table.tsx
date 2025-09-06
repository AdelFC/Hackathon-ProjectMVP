import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean
  hover?: boolean
  bordered?: boolean
}

export function Table({ 
  className, 
  striped = false,
  hover = false,
  bordered = false,
  children, 
  ...props 
}: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={clsx(
          'w-full text-sm',
          bordered && 'border border-gray-200 dark:border-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead 
      className={clsx(
        'border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50',
        className
      )} 
      {...props}
    >
      {children}
    </thead>
  )
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody 
      className={clsx('[&_tr:last-child]:border-0', className)} 
      {...props}
    >
      {children}
    </tbody>
  )
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean
}

export function TableRow({ 
  className, 
  hover = true,
  children, 
  ...props 
}: TableRowProps) {
  return (
    <tr
      className={clsx(
        'border-b border-gray-200 dark:border-gray-800 transition-colors',
        hover && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={clsx(
        'h-12 px-4 text-left align-middle font-medium text-gray-600 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={clsx(
        'p-4 align-middle',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}