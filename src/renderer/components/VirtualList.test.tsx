import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualList from './VirtualList';

interface TestItem {
  id: string;
  label: string;
}

function createItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i}`,
  }));
}

const defaultRenderItem = (item: TestItem, index: number) => (
  <div data-testid={`item-${index}`}>{item.label}</div>
);

const defaultGetKey = (item: TestItem) => item.id;

function renderVirtualList(
  props: Partial<React.ComponentProps<typeof VirtualList<TestItem>>> = {}
) {
  const items = props.items ?? createItems(100);
  return render(
    <VirtualList<TestItem>
      items={items}
      itemHeight={40}
      height={200}
      renderItem={defaultRenderItem}
      getItemKey={defaultGetKey}
      {...props}
    />
  );
}

describe('VirtualList', () => {
  // --- Rendering ---

  it('renders with list role', () => {
    renderVirtualList();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    renderVirtualList();
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '가상 스크롤 목록');
  });

  it('accepts custom aria-label', () => {
    renderVirtualList({ ariaLabel: '메시지 목록' });
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '메시지 목록');
  });

  it('applies custom className', () => {
    renderVirtualList({ className: 'my-class' });
    expect(screen.getByRole('list')).toHaveClass('virtual-list', 'my-class');
  });

  it('sets aria-rowcount to total item count', () => {
    renderVirtualList({ items: createItems(500) });
    expect(screen.getByRole('list')).toHaveAttribute('aria-rowcount', '500');
  });

  it('applies width and height styles', () => {
    renderVirtualList({ height: 300, width: 500 });
    const container = screen.getByRole('list');
    expect(container.style.height).toBe('300px');
    expect(container.style.width).toBe('500px');
  });

  it('defaults width to 100%', () => {
    renderVirtualList();
    const container = screen.getByRole('list');
    expect(container.style.width).toBe('100%');
  });

  // --- Virtualization ---

  it('renders only visible items plus overscan', () => {
    // 200px height / 40px items = 5 visible items
    // overscan=3 on each side: start=0, end = min(8, 100) = 8
    renderVirtualList({ items: createItems(100), overscan: 3 });
    const listItems = screen.getAllByRole('listitem');
    // Visible: ceil(200/40)=5, + overscan bottom 3 = 8
    expect(listItems.length).toBe(8);
  });

  it('does not render all 100 items', () => {
    renderVirtualList({ items: createItems(100) });
    // Should render far fewer than 100
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeLessThan(20);
  });

  it('renders all items when list is small enough to fit', () => {
    // 3 items, each 40px, container 200px — all fit
    renderVirtualList({ items: createItems(3) });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(3);
  });

  it('renders items with correct position styles', () => {
    renderVirtualList({ items: createItems(10) });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0].style.top).toBe('0px');
    expect(listItems[0].style.height).toBe('40px');
    expect(listItems[1].style.top).toBe('40px');
    expect(listItems[2].style.top).toBe('80px');
  });

  it('sets total content height via inner container', () => {
    const { container } = renderVirtualList({ items: createItems(50) });
    const inner = container.querySelector('.virtual-list-inner');
    // 50 items * 40px = 2000px
    expect(inner).toHaveStyle({ height: '2000px' });
  });

  // --- Data index ---

  it('sets data-index on each item wrapper', () => {
    renderVirtualList({ items: createItems(10) });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveAttribute('data-index', '0');
    expect(listItems[1]).toHaveAttribute('data-index', '1');
  });

  // --- Custom roles ---

  it('accepts custom role', () => {
    renderVirtualList({ role: 'feed' });
    expect(screen.getByRole('feed')).toBeInTheDocument();
  });

  it('accepts custom item role', () => {
    renderVirtualList({ itemRole: 'article' });
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  // --- Scroll behavior ---

  it('calls onScroll with scrollTop value', () => {
    const onScroll = vi.fn();
    renderVirtualList({ onScroll });
    const container = screen.getByRole('list');
    Object.defineProperty(container, 'scrollTop', { value: 120, configurable: true });
    fireEvent.scroll(container);
    expect(onScroll).toHaveBeenCalledWith(120);
  });

  it('updates visible items on scroll', () => {
    renderVirtualList({ items: createItems(100), overscan: 0 });
    const container = screen.getByRole('list');

    // Before scroll: items 0-4 visible (200/40 = 5)
    const beforeItems = screen.getAllByRole('listitem');
    expect(beforeItems[0]).toHaveAttribute('data-index', '0');

    // Scroll to 400px (item 10 is at top)
    Object.defineProperty(container, 'scrollTop', { value: 400, configurable: true });
    fireEvent.scroll(container);

    const afterItems = screen.getAllByRole('listitem');
    expect(afterItems[0]).toHaveAttribute('data-index', '10');
  });

  it('calls onVisibleRangeChange when range changes', () => {
    const onVisibleRangeChange = vi.fn();
    renderVirtualList({ items: createItems(100), overscan: 0, onVisibleRangeChange });

    // Initial render triggers a range change
    expect(onVisibleRangeChange).toHaveBeenCalledWith(0, 5);

    // Scroll to new position
    const container = screen.getByRole('list');
    Object.defineProperty(container, 'scrollTop', { value: 200, configurable: true });
    fireEvent.scroll(container);

    expect(onVisibleRangeChange).toHaveBeenCalledWith(5, 10);
  });

  // --- Key extractor ---

  it('uses getItemKey for React keys', () => {
    const items = [
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ];
    renderVirtualList({ items, getItemKey: (item) => item.id });
    // Verify items render without key warnings
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('works without getItemKey (uses index)', () => {
    const items = createItems(5);
    renderVirtualList({ items, getItemKey: undefined });
    expect(screen.getAllByRole('listitem').length).toBe(5);
  });

  // --- Overscan ---

  it('uses default overscan of 3', () => {
    // 200/40 = 5 visible + 3 overscan bottom = 8
    renderVirtualList({ items: createItems(100) });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(8);
  });

  it('respects overscan=0', () => {
    // 200/40 = 5 visible, 0 overscan
    renderVirtualList({ items: createItems(100), overscan: 0 });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(5);
  });

  it('respects large overscan', () => {
    // 200/40 = 5 visible + 10 overscan bottom = 15
    renderVirtualList({ items: createItems(100), overscan: 10 });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(15);
  });

  // --- Empty list ---

  it('renders empty list', () => {
    renderVirtualList({ items: [] });
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('sets aria-rowcount to 0 for empty list', () => {
    renderVirtualList({ items: [] });
    expect(screen.getByRole('list')).toHaveAttribute('aria-rowcount', '0');
  });

  // --- Render function ---

  it('passes correct item and index to renderItem', () => {
    const renderItem = vi.fn((_item: TestItem, _index: number) => <div>rendered</div>);
    const items = createItems(3);
    renderVirtualList({ items, renderItem });
    expect(renderItem).toHaveBeenCalledWith(items[0], 0);
    expect(renderItem).toHaveBeenCalledWith(items[1], 1);
    expect(renderItem).toHaveBeenCalledWith(items[2], 2);
  });

  // --- Scroll to bottom ---

  it('scrolls to bottom when scrollToBottom is true and items are added', () => {
    const items = createItems(20);
    const { rerender } = render(
      <VirtualList<TestItem>
        items={items}
        itemHeight={40}
        height={200}
        renderItem={defaultRenderItem}
        getItemKey={defaultGetKey}
        scrollToBottom
      />
    );

    const container = screen.getByRole('list');
    // Mock scrollTop setter
    let capturedScrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      get: () => capturedScrollTop,
      set: (v: number) => { capturedScrollTop = v; },
      configurable: true,
    });

    // Add more items
    const newItems = createItems(30);
    rerender(
      <VirtualList<TestItem>
        items={newItems}
        itemHeight={40}
        height={200}
        renderItem={defaultRenderItem}
        getItemKey={defaultGetKey}
        scrollToBottom
      />
    );

    // scrollTop should be set to max scroll (30*40 - 200 = 1000)
    expect(capturedScrollTop).toBe(1000);
  });

  it('does not scroll to bottom when scrollToBottom is false', () => {
    const items = createItems(20);
    const { rerender } = render(
      <VirtualList<TestItem>
        items={items}
        itemHeight={40}
        height={200}
        renderItem={defaultRenderItem}
        getItemKey={defaultGetKey}
      />
    );

    const container = screen.getByRole('list');
    let capturedScrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      get: () => capturedScrollTop,
      set: (v: number) => { capturedScrollTop = v; },
      configurable: true,
    });

    const newItems = createItems(30);
    rerender(
      <VirtualList<TestItem>
        items={newItems}
        itemHeight={40}
        height={200}
        renderItem={defaultRenderItem}
        getItemKey={defaultGetKey}
      />
    );

    expect(capturedScrollTop).toBe(0);
  });

  // --- Overflow style ---

  it('has overflow auto style', () => {
    renderVirtualList();
    expect(screen.getByRole('list').style.overflow).toBe('auto');
  });

  // --- Inner container ---

  it('has virtual-list-inner container', () => {
    const { container } = renderVirtualList();
    expect(container.querySelector('.virtual-list-inner')).toBeInTheDocument();
  });

  it('inner container uses relative positioning', () => {
    const { container } = renderVirtualList();
    const inner = container.querySelector('.virtual-list-inner') as HTMLElement;
    expect(inner.style.position).toBe('relative');
  });
});
