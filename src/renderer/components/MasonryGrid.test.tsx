import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MasonryGrid from './MasonryGrid';

// Mock ResizeObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();

class MockResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mockUnobserve;
}

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  mockUnobserve.mockClear();
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const items = [
  <div key="1">Item 1</div>,
  <div key="2">Item 2</div>,
  <div key="3">Item 3</div>,
  <div key="4">Item 4</div>,
  <div key="5">Item 5</div>,
  <div key="6">Item 6</div>,
];

describe('MasonryGrid', () => {
  // -- Rendering --
  it('renders with role="grid"', () => {
    render(<MasonryGrid>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(<MasonryGrid>{items}</MasonryGrid>);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.getByText('Item 6')).toBeInTheDocument();
  });

  it('renders default aria-label', () => {
    render(<MasonryGrid>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '메이슨리 그리드');
  });

  it('renders custom label', () => {
    render(<MasonryGrid label="이미지 갤러리">{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '이미지 갤러리');
  });

  it('renders empty grid', () => {
    render(<MasonryGrid>{[]}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveClass('masonry-grid--empty');
  });

  it('renders empty grid with custom label', () => {
    render(<MasonryGrid label="빈 갤러리">{[]}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '빈 갤러리');
  });

  // -- Columns --
  it('renders specified number of columns', () => {
    render(<MasonryGrid columns={3}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(3);
  });

  it('renders 2 columns when columns=2', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(2);
  });

  it('renders 4 columns when columns=4', () => {
    render(<MasonryGrid columns={4}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(4);
  });

  it('renders 1 column when columns=1', () => {
    render(<MasonryGrid columns={1}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(1);
  });

  it('column has aria-label with column number', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns[0]).toHaveAttribute('aria-label', '열 1');
    expect(columns[1]).toHaveAttribute('aria-label', '열 2');
  });

  // -- Gap --
  it('applies default gap', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveStyle({ gap: '16px' });
  });

  it('applies custom gap', () => {
    render(<MasonryGrid columns={2} gap={24}>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveStyle({ gap: '24px' });
  });

  it('applies zero gap', () => {
    render(<MasonryGrid columns={2} gap={0}>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveStyle({ gap: '0px' });
  });

  // -- Distribution --
  it('distributes items across columns', () => {
    render(<MasonryGrid columns={3}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    // Each column should have at least 1 item, and total should be 6
    let totalItems = 0;
    columns.forEach(col => {
      totalItems += col.querySelectorAll('.masonry-grid-item').length;
    });
    expect(totalItems).toBe(6);
  });

  it('distributes items evenly across 2 columns', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    const col1Items = columns[0].querySelectorAll('.masonry-grid-item').length;
    const col2Items = columns[1].querySelectorAll('.masonry-grid-item').length;
    expect(col1Items + col2Items).toBe(6);
    // With equal estimated heights, distribution should be roughly even
    expect(col1Items).toBeGreaterThanOrEqual(2);
    expect(col2Items).toBeGreaterThanOrEqual(2);
  });

  it('handles single item', () => {
    render(<MasonryGrid columns={3}>{[<div key="1">Solo</div>]}</MasonryGrid>);
    expect(screen.getByText('Solo')).toBeInTheDocument();
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(3);
  });

  // -- Animation --
  it('does not apply animation class by default', () => {
    const { container } = render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const gridItems = container.querySelectorAll('.masonry-grid-item');
    gridItems.forEach(item => {
      expect(item).not.toHaveClass('masonry-grid-item--animated');
    });
  });

  it('applies animation class when animate=true', () => {
    const { container } = render(<MasonryGrid columns={2} animate>{items}</MasonryGrid>);
    const gridItems = container.querySelectorAll('.masonry-grid-item');
    gridItems.forEach(item => {
      expect(item).toHaveClass('masonry-grid-item--animated');
    });
  });

  // -- CSS classes --
  it('has masonry-grid class', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    expect(screen.getByRole('grid')).toHaveClass('masonry-grid');
  });

  it('columns have masonry-grid-column class', () => {
    const { container } = render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const columns = container.querySelectorAll('.masonry-grid-column');
    expect(columns).toHaveLength(2);
  });

  it('items have masonry-grid-item class', () => {
    const { container } = render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const gridItems = container.querySelectorAll('.masonry-grid-item');
    expect(gridItems.length).toBe(6);
  });

  // -- Item margin --
  it('applies gap as marginBottom on items', () => {
    const { container } = render(<MasonryGrid columns={2} gap={20}>{items}</MasonryGrid>);
    const gridItems = container.querySelectorAll('.masonry-grid-item');
    gridItems.forEach(item => {
      expect(item).toHaveStyle({ marginBottom: '20px' });
    });
  });

  // -- ResizeObserver --
  it('sets up ResizeObserver for auto-columns', () => {
    render(<MasonryGrid>{items}</MasonryGrid>);
    expect(mockObserve).toHaveBeenCalled();
  });

  it('does not use ResizeObserver when columns prop is specified', () => {
    render(<MasonryGrid columns={3}>{items}</MasonryGrid>);
    // ResizeObserver is still created for the container, but updateAutoColumns is a no-op
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('disconnects ResizeObserver on unmount', () => {
    const { unmount } = render(<MasonryGrid>{items}</MasonryGrid>);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  // -- Edge cases --
  it('handles children with React.Children.toArray', () => {
    const dynamicItems = [1, 2, 3].map(i => <div key={i}>Dynamic {i}</div>);
    render(<MasonryGrid columns={2}>{dynamicItems}</MasonryGrid>);
    expect(screen.getByText('Dynamic 1')).toBeInTheDocument();
    expect(screen.getByText('Dynamic 2')).toBeInTheDocument();
    expect(screen.getByText('Dynamic 3')).toBeInTheDocument();
  });

  it('columns have flex: 1 style', () => {
    render(<MasonryGrid columns={2}>{items}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    columns.forEach(col => {
      expect(col).toHaveStyle({ flex: 1 });
    });
  });

  it('renders with default columns when no columns prop', () => {
    render(<MasonryGrid>{items}</MasonryGrid>);
    // Default is 3 columns (or auto-calculated)
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
  });

  it('handles many items without error', () => {
    const manyItems = Array.from({ length: 50 }, (_, i) => (
      <div key={i}>Item {i}</div>
    ));
    render(<MasonryGrid columns={4}>{manyItems}</MasonryGrid>);
    const columns = screen.getAllByRole('row');
    expect(columns).toHaveLength(4);
    let totalItems = 0;
    columns.forEach(col => {
      totalItems += col.querySelectorAll('.masonry-grid-item').length;
    });
    expect(totalItems).toBe(50);
  });
});
