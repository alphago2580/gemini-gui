import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable, { DataTableColumn } from './DataTable';

interface User {
  name: string;
  age: number;
  email: string;
  [key: string]: unknown;
}

const columns: DataTableColumn<User>[] = [
  { key: 'name', header: '이름', sortable: true },
  { key: 'age', header: '나이', sortable: true },
  { key: 'email', header: '이메일' },
];

const data: User[] = [
  { name: '김철수', age: 30, email: 'kim@test.com' },
  { name: '이영희', age: 25, email: 'lee@test.com' },
  { name: '박지성', age: 35, email: 'park@test.com' },
];

describe('DataTable', () => {
  // -- Rendering --
  it('renders with role="grid"', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '데이터 테이블');
  });

  it('uses caption as aria-label', () => {
    render(<DataTable columns={columns} data={data} caption="사용자 목록" />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '사용자 목록');
  });

  it('renders caption text', () => {
    render(<DataTable columns={columns} data={data} caption="사용자 목록" />);
    expect(screen.getByText('사용자 목록')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('나이')).toBeInTheDocument();
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('이영희')).toBeInTheDocument();
    expect(screen.getByText('박지성')).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    render(<DataTable columns={columns} data={data} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it('renders cells for each column', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('kim@test.com')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    const { container } = render(<DataTable columns={columns} data={data} id="users-table" />);
    expect(container.querySelector('#users-table')).toBeInTheDocument();
  });

  // -- Sizes --
  it('applies small size class', () => {
    render(<DataTable columns={columns} data={data} size="small" />);
    expect(screen.getByRole('grid').className).toContain('data-table--small');
  });

  it('applies medium size class by default', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('grid').className).toContain('data-table--medium');
  });

  it('applies large size class', () => {
    render(<DataTable columns={columns} data={data} size="large" />);
    expect(screen.getByRole('grid').className).toContain('data-table--large');
  });

  // -- Variants --
  it('applies striped class', () => {
    render(<DataTable columns={columns} data={data} striped />);
    expect(screen.getByRole('grid').className).toContain('data-table--striped');
  });

  it('applies hoverable class by default', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('grid').className).toContain('data-table--hoverable');
  });

  it('does not apply hoverable when false', () => {
    render(<DataTable columns={columns} data={data} hoverable={false} />);
    expect(screen.getByRole('grid').className).not.toContain('data-table--hoverable');
  });

  it('applies bordered class', () => {
    render(<DataTable columns={columns} data={data} bordered />);
    expect(screen.getByRole('grid').className).toContain('data-table--bordered');
  });

  // -- Sorting --
  it('sorts ascending on first click', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    const cells = screen.getAllByRole('cell');
    // First data row should be age 25 (이영희)
    const ageIndex = 1; // second column
    expect(cells[ageIndex].textContent).toBe('25');
  });

  it('sorts descending on second click', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    fireEvent.click(screen.getByText('나이'));
    const cells = screen.getAllByRole('cell');
    expect(cells[1].textContent).toBe('35');
  });

  it('resets sort on third click', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    fireEvent.click(screen.getByText('나이'));
    fireEvent.click(screen.getByText('나이'));
    const cells = screen.getAllByRole('cell');
    // Back to original order: 김철수 age 30
    expect(cells[1].textContent).toBe('30');
  });

  it('shows ▲ for ascending sort', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('shows ▼ for descending sort', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    fireEvent.click(screen.getByText('나이'));
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('calls onSort callback', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={data} onSort={onSort} />);
    fireEvent.click(screen.getByText('나이'));
    expect(onSort).toHaveBeenCalledWith('age', 'asc');
  });

  it('does not sort non-sortable columns', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={data} onSort={onSort} />);
    fireEvent.click(screen.getByText('이메일'));
    expect(onSort).not.toHaveBeenCalled();
  });

  it('sets aria-sort on sorted column', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    const headers = screen.getAllByRole('columnheader');
    expect(headers[1]).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sets aria-sort=descending', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('나이'));
    fireEvent.click(screen.getByText('나이'));
    const headers = screen.getAllByRole('columnheader');
    expect(headers[1]).toHaveAttribute('aria-sort', 'descending');
  });

  it('sets aria-sort=none on unsorted sortable columns', () => {
    render(<DataTable columns={columns} data={data} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveAttribute('aria-sort', 'none');
  });

  it('no aria-sort on non-sortable columns', () => {
    render(<DataTable columns={columns} data={data} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[2]).not.toHaveAttribute('aria-sort');
  });

  // -- Controlled sorting --
  it('uses controlled sort', () => {
    render(<DataTable columns={columns} data={data} sortKey="age" sortDirection="asc" />);
    const cells = screen.getAllByRole('cell');
    expect(cells[1].textContent).toBe('25');
  });

  // -- Keyboard sorting --
  it('sorts on Enter key', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={data} onSort={onSort} />);
    const header = screen.getByText('이름').closest('th')!;
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('sorts on Space key', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={data} onSort={onSort} />);
    const header = screen.getByText('이름').closest('th')!;
    fireEvent.keyDown(header, { key: ' ' });
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  // -- Row selection --
  it('calls onRowClick when row clicked', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('김철수'));
    expect(onRowClick).toHaveBeenCalledWith(data[0], 0);
  });

  it('applies selected class to selected row', () => {
    render(<DataTable columns={columns} data={data} selectedRowIndex={1} />);
    const rows = screen.getAllByRole('row');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('marks non-selected rows as aria-selected false', () => {
    render(<DataTable columns={columns} data={data} selectedRowIndex={1} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('makes rows focusable when onRowClick provided', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('tabindex', '0');
  });

  it('selects row on Enter key', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    const rows = screen.getAllByRole('row');
    fireEvent.keyDown(rows[1], { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledWith(data[0], 0);
  });

  // -- Empty state --
  it('shows empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="결과 없음" />);
    expect(screen.getByText('결과 없음')).toBeInTheDocument();
  });

  it('renders empty cell spanning all columns', () => {
    render(<DataTable columns={columns} data={[]} />);
    const emptyCell = screen.getByText('데이터가 없습니다');
    expect(emptyCell).toHaveAttribute('colspan', '3');
  });

  // -- Custom render --
  it('supports custom column render', () => {
    const customColumns: DataTableColumn<User>[] = [
      { key: 'name', header: '이름', render: (val) => `** ${val} **` },
      { key: 'age', header: '나이' },
      { key: 'email', header: '이메일' },
    ];
    render(<DataTable columns={customColumns} data={data} />);
    expect(screen.getByText('** 김철수 **')).toBeInTheDocument();
  });

  // -- Column width --
  it('applies column width', () => {
    const widthColumns: DataTableColumn<User>[] = [
      { key: 'name', header: '이름', width: '200px' },
      { key: 'age', header: '나이' },
      { key: 'email', header: '이메일' },
    ];
    render(<DataTable columns={widthColumns} data={data} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveStyle({ width: '200px' });
  });

  // -- Null values --
  it('handles null/undefined values', () => {
    const nullData = [{ name: null, age: undefined, email: '' }] as unknown as User[];
    render(<DataTable columns={columns} data={nullData} />);
    const cells = screen.getAllByRole('cell');
    expect(cells[0].textContent).toBe('');
    expect(cells[1].textContent).toBe('');
  });

  // -- Wrapper CSS --
  it('wrapper has correct CSS class', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    expect(container.firstChild).toHaveClass('data-table-wrapper');
  });

  // -- Sortable header tabIndex --
  it('sortable headers have tabIndex=0', () => {
    render(<DataTable columns={columns} data={data} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveAttribute('tabindex', '0'); // name - sortable
    expect(headers[1]).toHaveAttribute('tabindex', '0'); // age - sortable
    expect(headers[2]).not.toHaveAttribute('tabindex');   // email - not sortable
  });

  // -- String sort --
  it('sorts strings alphabetically', () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByText('이름'));
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    const cells = within(firstDataRow).getAllByRole('cell');
    // Korean alphabetical: 김철수 < 박지성 < 이영희
    expect(cells[0].textContent).toBe('김철수');
  });
});
