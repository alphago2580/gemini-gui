import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VirtualizedList from './VirtualizedList';

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: `item-${i}`, label: `Item ${i}` }));

const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 200;

const defaultRender = (item: { id: string; label: string }) => (
  <span>{item.label}</span>
);

const defaultKeyExtractor = (item: { id: string; label: string }) => item.id;

describe('VirtualizedList', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let cafSpy: ReturnType<typeof vi.spyOn>;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks.length = 0;
    cbs.forEach(cb => cb(performance.now()));
  }

  // -- Rendering --
  it('renders with role="list"', () => {
    const items = makeItems(10);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '가상 스크롤 목록');
  });

  it('uses custom label', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        label="메시지 목록"
      />
    );
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '메시지 목록');
  });

  it('applies custom id', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        id="my-vlist"
      />
    );
    expect(screen.getByRole('list')).toHaveAttribute('id', 'my-vlist');
  });

  it('applies custom className', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        className="custom-class"
      />
    );
    const list = screen.getByRole('list');
    expect(list).toHaveClass('virtualized-list');
    expect(list).toHaveClass('custom-class');
  });

  it('sets container height style', () => {
    const items = makeItems(10);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={300}
        renderItem={defaultRender}
      />
    );
    const list = screen.getByRole('list');
    expect(list.style.height).toBe('300px');
  });

  it('sets total height on inner container', () => {
    const items = makeItems(100);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    const inner = container.querySelector('.virtualized-list-inner');
    expect(inner).not.toBeNull();
    expect(inner!.style.height).toBe(`${100 * ITEM_HEIGHT}px`);
  });

  it('renders aria-rowcount equal to total items', () => {
    const items = makeItems(50);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    expect(screen.getByRole('list')).toHaveAttribute('aria-rowcount', '50');
  });

  // -- Virtualization --
  it('renders only visible items plus overscan', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={2}
      />
    );
    // Container 200px / 40px = 5 visible + 2 overscan after = 7 items max at top
    const rendered = screen.getAllByRole('listitem');
    expect(rendered.length).toBeLessThanOrEqual(8); // 5 visible + 2 after + possibly 0 before
    expect(rendered.length).toBeGreaterThanOrEqual(5);
  });

  it('does not render items far from viewport', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={2}
      />
    );
    expect(screen.queryByText('Item 50')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 99')).not.toBeInTheDocument();
  });

  it('renders items near the top', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('positions items absolutely with correct top offset', () => {
    const items = makeItems(10);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    const listItems = container.querySelectorAll('.virtualized-list-item');
    const first = listItems[0] as HTMLElement;
    expect(first.style.position).toBe('absolute');
    expect(first.style.top).toBe('0px');
    expect(first.style.height).toBe(`${ITEM_HEIGHT}px`);
  });

  it('second item has correct top offset', () => {
    const items = makeItems(10);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    const listItems = container.querySelectorAll('.virtualized-list-item');
    const second = listItems[1] as HTMLElement;
    expect(second.style.top).toBe(`${ITEM_HEIGHT}px`);
  });

  it('renders all items when list fits in container', () => {
    const items = makeItems(3);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  // -- Empty list --
  it('renders empty list without errors', () => {
    render(
      <VirtualizedList
        items={[]}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  // -- keyExtractor --
  it('uses index as key when keyExtractor is not provided', () => {
    const items = makeItems(5);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    const listItems = container.querySelectorAll('.virtualized-list-item');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('calls keyExtractor for each visible item', () => {
    const items = makeItems(5);
    const keyExtractor = vi.fn((item: { id: string; label: string }) => item.id);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={keyExtractor}
      />
    );
    expect(keyExtractor).toHaveBeenCalled();
  });

  // -- renderItem --
  it('calls renderItem with item and index', () => {
    const items = makeItems(5);
    const renderItem = vi.fn((item: { id: string; label: string }, index: number) => (
      <span data-testid={`item-${index}`}>{item.label}</span>
    ));
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={renderItem}
        keyExtractor={defaultKeyExtractor}
      />
    );
    expect(renderItem).toHaveBeenCalled();
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
  });

  // -- aria-rowindex --
  it('sets aria-rowindex on each item (1-based)', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveAttribute('aria-rowindex', '1');
    expect(listItems[1]).toHaveAttribute('aria-rowindex', '2');
  });

  // -- Scroll handling --
  it('recalculates visible items on scroll', () => {
    const items = makeItems(100);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={1}
      />
    );
    const listEl = screen.getByRole('list');

    // Scroll down to show items starting at index 10
    Object.defineProperty(listEl, 'scrollTop', { value: 400, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    // Item 10 should now be visible (scrollTop=400, 400/40=10)
    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.getByText('Item 11')).toBeInTheDocument();
  });

  it('removes items that scrolled out of view', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={1}
      />
    );
    const listEl = screen.getByRole('list');

    // Scroll far down
    Object.defineProperty(listEl, 'scrollTop', { value: 2000, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    // Items at the top should not be rendered
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  // -- onEndReached --
  it('calls onEndReached when scrolled near the end', () => {
    const items = makeItems(100);
    const onEndReached = vi.fn();
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        onEndReached={onEndReached}
        endReachedThreshold={0.8}
      />
    );
    const listEl = screen.getByRole('list');

    // Total height = 4000px, threshold 0.8 → need (scrollTop + 200) / 4000 >= 0.8
    // scrollTop + 200 >= 3200 → scrollTop >= 3000
    Object.defineProperty(listEl, 'scrollTop', { value: 3200, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('does not call onEndReached when not near the end', () => {
    const items = makeItems(100);
    const onEndReached = vi.fn();
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        onEndReached={onEndReached}
        endReachedThreshold={0.8}
      />
    );
    const listEl = screen.getByRole('list');

    Object.defineProperty(listEl, 'scrollTop', { value: 100, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('fires onEndReached only once until scrolled back', () => {
    const items = makeItems(100);
    const onEndReached = vi.fn();
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        onEndReached={onEndReached}
        endReachedThreshold={0.8}
      />
    );
    const listEl = screen.getByRole('list');

    // Scroll near end
    Object.defineProperty(listEl, 'scrollTop', { value: 3200, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    // Scroll again near end
    Object.defineProperty(listEl, 'scrollTop', { value: 3500, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    expect(onEndReached).toHaveBeenCalledTimes(1);

    // Scroll back up
    Object.defineProperty(listEl, 'scrollTop', { value: 100, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    // Scroll near end again — should fire again
    Object.defineProperty(listEl, 'scrollTop', { value: 3200, configurable: true });
    fireEvent.scroll(listEl);
    act(() => flushRaf());

    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  // -- Overscan --
  it('uses default overscan of 3', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    // 5 visible + 3 overscan after = 8
    const rendered = screen.getAllByRole('listitem');
    expect(rendered.length).toBeLessThanOrEqual(9);
    expect(rendered.length).toBeGreaterThanOrEqual(5);
  });

  it('respects custom overscan value', () => {
    const items = makeItems(100);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={0}
      />
    );
    // 5 visible + 0 overscan = 5
    const rendered = screen.getAllByRole('listitem');
    expect(rendered.length).toBeLessThanOrEqual(6);
  });

  // -- CSS classes --
  it('has virtualized-list class on container', () => {
    const items = makeItems(5);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    expect(screen.getByRole('list')).toHaveClass('virtualized-list');
  });

  it('has virtualized-list-inner class', () => {
    const items = makeItems(5);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    expect(container.querySelector('.virtualized-list-inner')).toBeInTheDocument();
  });

  it('has virtualized-list-item class on items', () => {
    const items = makeItems(5);
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );
    const listItems = container.querySelectorAll('.virtualized-list-item');
    expect(listItems.length).toBeGreaterThan(0);
  });

  // -- Cleanup --
  it('cleans up animation frame on unmount', () => {
    const items = makeItems(100);
    const { unmount } = render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
      />
    );

    const listEl = screen.getByRole('list');
    fireEvent.scroll(listEl);

    unmount();
    expect(cafSpy).toHaveBeenCalled();
  });

  // -- Single item --
  it('renders single item list', () => {
    const items = makeItems(1);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
      />
    );
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  // -- Large overscan doesn't exceed bounds --
  it('overscan does not exceed item count', () => {
    const items = makeItems(3);
    render(
      <VirtualizedList
        items={items}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={defaultRender}
        keyExtractor={defaultKeyExtractor}
        overscan={100}
      />
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
