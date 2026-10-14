import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from './checkbox';

export interface TableColumn<T> {
  id: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  width?: string | number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  cellClassName?: (item: T) => string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  selectedRows?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  showSelection?: boolean;
  stickyHeader?: boolean;
}

function Table<T>({
  columns,
  data,
  keyExtractor = (item: any) => item.id,
  sortBy,
  sortOrder,
  onSort,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  isLoading = false,
  emptyMessage = 'No data available',
  className,
  variant = 'default',
  size = 'md',
  showHeader = true,
  showSelection = false,
  stickyHeader = false,
}: TableProps<T>): React.ReactElement {
  const variants = {
    default: '',
    bordered: 'border border-secondary-200',
    striped: 'odd:bg-secondary-50',
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const allSelected = showSelection && data.length > 0 && selectedRows.length === data.length;
  const someSelected = showSelection && selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSort = (columnId: string) => {
    if (onSort) {
      if (sortBy === columnId) {
        onSort('');
      } else {
        onSort(columnId);
      }
    }
  };

  const renderSortIcon = (columnId: string) => {
    if (sortBy !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 text-secondary-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-500" />
    );
  };

  const renderHeader = () => (
    <thead
      className={cn(
        'bg-secondary-50',
        stickyHeader && 'sticky top-0 z-10'
      )}
    >
      <tr>
        {showSelection && (
          <th
            className={cn(
              'px-4 py-3 font-medium text-secondary-500',
              sizes[size]
            )}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={onSelectAll}
              aria-label="Select all"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              'px-4 py-3 font-medium text-secondary-500',
              aligns[column.align || 'left'],
              column.sortable && 'cursor-pointer select-none hover:bg-secondary-100',
              sizes[size],
              column.headerClassName
            )}
            onClick={() => column.sortable && handleSort(column.id)}
            style={{ width: column.width }}
          >
            <div className="flex items-center gap-1">
              <span>{column.header}</span>
              {column.sortable && renderSortIcon(column.id)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = () => (
    <tbody className={variants[variant]}>
      {isLoading ? (
        <tr>
          <td
            colSpan={columns.length + (showSelection ? 1 : 0)}
            className="px-4 py-8 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      ) : data.length === 0 ? (
        <tr>
          <td
            colSpan={columns.length + (showSelection ? 1 : 0)}
            className="px-4 py-8 text-center text-secondary-500"
          >
            {emptyMessage}
          </td>
        </tr>
      ) : (
        data.map((item, index) => {
          const key = keyExtractor(item) || index;
          const isSelected = selectedRows.includes(key);

          return (
            <tr
              key={key}
              className={cn(
                'hover:bg-secondary-50 transition-colors',
                isSelected && 'bg-primary-50'
              )}
              onClick={() => onSelectRow && onSelectRow(key)}
            >
              {showSelection && (
                <td className="px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelectRow?.(key)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select row ${key}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    'px-4 py-3',
                    aligns[column.align || 'left'],
                    sizes[size],
                    column.cellClassName?.(item)
                  )}
                  style={{ width: column.width }}
                >
                  {column.accessor(item)}
                </td>
              ))}
            </tr>
          );
        })
      )}
    </tbody>
  );

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-lg',
        variant === 'bordered' && 'border border-secondary-200',
        className
      )}
    >
      <table className="w-full">
        {showHeader && renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
}

// Table Cell component for better formatting
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({
  className,
  align = 'left',
  colSpan,
  children,
  ...props
}) => (
  <td
    className={cn(
      'px-4 py-3',
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}
    colSpan={colSpan}
    {...props}
  >
    {children}
  </td>
);

// Table Header Cell component
export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  columnId?: string;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  className,
  align = 'left',
  colSpan,
  sortable = false,
  sortBy,
  sortOrder,
  onSort,
  columnId,
  children,
  ...props
}) => {
  const renderSortIcon = () => {
    if (!sortable) return null;
    if (sortBy !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 text-secondary-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-500" />
    );
  };

  const handleClick = () => {
    if (sortable && onSort && columnId) {
      onSort(columnId);
    }
  };

  return (
    <th
      className={cn(
        'px-4 py-3 font-medium text-secondary-500',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        sortable && 'cursor-pointer select-none hover:bg-secondary-100',
        className
      )}
      colSpan={colSpan}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {renderSortIcon()}
      </div>
    </th>
  );
};

// Table Row component
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  onClick?: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  className,
  selected = false,
  onClick,
  children,
  ...props
}) => (
  <tr
    className={cn(
      'hover:bg-secondary-50 transition-colors',
      selected && 'bg-primary-50',
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
);

export { Table, TableCell, TableHeaderCell, TableRow };
