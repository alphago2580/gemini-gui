import React, { useState, useCallback, useMemo } from 'react';
import './DataTable.css';

export type SortDirection = 'asc' | 'desc' | 'none';
export type DataTableSize = 'small' | 'medium' | 'large';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  selectedRowIndex?: number;
  onRowClick?: (row: T, index: number) => void;
  size?: DataTableSize;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  emptyMessage?: string;
  caption?: string;
  id?: string;
}

function getNextDirection(current: SortDirection): SortDirection {
  if (current === 'none') return 'asc';
  if (current === 'asc') return 'desc';
  return 'none';
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function DataTableInner<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  selectedRowIndex,
  onRowClick,
  size = 'medium',
  striped = false,
  hoverable = true,
  bordered = false,
  emptyMessage = '데이터가 없습니다',
  caption,
  id,
}: DataTableProps<T>) {
  const [internalSortKey, setInternalSortKey] = useState<string>('');
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>('none');

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const handleSort = useCallback((key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable) return;

    const currentDir = sortKey === key ? sortDirection : 'none';
    const nextDir = getNextDirection(currentDir);

    if (controlledSortKey !== undefined) {
      onSort?.(key, nextDir);
    } else {
      setInternalSortKey(key);
      setInternalSortDirection(nextDir);
      onSort?.(key, nextDir);
    }
  }, [columns, sortKey, sortDirection, controlledSortKey, onSort]);

  const sortedData = useMemo(() => {
    if (!sortKey || sortDirection === 'none') return data;
    const sorted = [...data].sort((a, b) => {
      const result = defaultCompare(a[sortKey], b[sortKey]);
      return sortDirection === 'desc' ? -result : result;
    });
    return sorted;
  }, [data, sortKey, sortDirection]);

  const handleHeaderKeyDown = useCallback((e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(key);
    }
  }, [handleSort]);

  const getSortIndicator = useCallback((key: string) => {
    if (sortKey !== key || sortDirection === 'none') return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }, [sortKey, sortDirection]);

  const handleRowKeyDown = useCallback((e: React.KeyboardEvent, row: T, rowIndex: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(row, rowIndex);
    }
  }, [onRowClick]);

  const className = [
    'data-table',
    `data-table--${size}`,
    striped ? 'data-table--striped' : '',
    hoverable ? 'data-table--hoverable' : '',
    bordered ? 'data-table--bordered' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="data-table-wrapper" id={id}>
      <table className={className} role="grid" aria-label={caption || '데이터 테이블'}>
        {caption && <caption className="data-table-caption">{caption}</caption>}
        <thead>
          <tr role="row">
            {columns.map(col => {
              const isSortable = col.sortable;
              const isSorted = sortKey === col.key && sortDirection !== 'none';
              const headerClass = [
                'data-table-th',
                isSortable ? 'data-table-th--sortable' : '',
                isSorted ? 'data-table-th--sorted' : '',
              ].filter(Boolean).join(' ');

              return (
                <th
                  key={col.key}
                  className={headerClass}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                  onKeyDown={isSortable ? e => handleHeaderKeyDown(e, col.key) : undefined}
                  tabIndex={isSortable ? 0 : undefined}
                  role="columnheader"
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : isSortable
                        ? 'none'
                        : undefined
                  }
                >
                  <span className="data-table-th-content">
                    {col.header}
                    {isSortable && (
                      <span className="data-table-sort-indicator" aria-hidden="true">
                        {getSortIndicator(col.key)}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                className="data-table-empty"
                colSpan={columns.length}
                role="cell"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const isSelected = selectedRowIndex === rowIndex;
              const rowClass = [
                'data-table-row',
                isSelected ? 'data-table-row--selected' : '',
              ].filter(Boolean).join(' ');

              return (
                <tr
                  key={rowIndex}
                  className={rowClass}
                  role="row"
                  aria-selected={isSelected}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, row, rowIndex) : undefined}
                >
                  {columns.map(col => (
                    <td key={col.key} className="data-table-td" role="cell">
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const DataTable = React.memo(DataTableInner) as typeof DataTableInner;
export default DataTable;
