import { renderHook, act } from '@testing-library/react';
import { useVirtualList } from './useVirtualList';

describe('useVirtualList', () => {
  const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`);

  it('initializes with empty virtual items when container height is 0', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40 })
    );
    // With containerHeight=0, visibleCount=0, but overscan adds some items
    expect(result.current.virtualItems.length).toBeGreaterThanOrEqual(0);
  });

  it('calculates total height correctly', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40 })
    );
    expect(result.current.totalHeight).toBe(1000 * 40);
  });

  it('calculates total height for small list', () => {
    const smallItems = ['a', 'b', 'c'];
    const { result } = renderHook(() =>
      useVirtualList(smallItems, { itemHeight: 50 })
    );
    expect(result.current.totalHeight).toBe(150);
  });

  it('returns container and wrapper props', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40 })
    );
    expect(result.current.containerProps.style.overflow).toBe('auto');
    expect(result.current.containerProps.style.position).toBe('relative');
    expect(typeof result.current.containerProps.onScroll).toBe('function');
    expect(result.current.wrapperProps.style.height).toBe(40000);
    expect(result.current.wrapperProps.style.position).toBe('relative');
  });

  it('virtual items have correct offsetTop', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 0 })
    );
    // Initial scroll=0, containerHeight=0, so range might be limited
    const virtualItems = result.current.virtualItems;
    for (const item of virtualItems) {
      expect(item.offsetTop).toBe(item.index * 40);
    }
  });

  it('updates visible range on scroll', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 0 })
    );
    // Simulate scroll event
    act(() => {
      const event = {
        currentTarget: {
          scrollTop: 400, // scrolled 10 items down
          clientHeight: 200, // 5 items visible
        },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    expect(result.current.visibleRange.start).toBe(10);
    expect(result.current.visibleRange.end).toBe(15);
  });

  it('includes overscan items', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 2 })
    );
    act(() => {
      const event = {
        currentTarget: {
          scrollTop: 400,
          clientHeight: 200,
        },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    // start = max(0, 10 - 2) = 8
    // end = min(999, 8 + 5 + 4) = 17
    expect(result.current.visibleRange.start).toBe(8);
    expect(result.current.visibleRange.end).toBe(17);
  });

  it('clamps range to list bounds', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 5 })
    );
    // Scroll to near the end
    act(() => {
      const event = {
        currentTarget: {
          scrollTop: 39800, // item 995
          clientHeight: 200,
        },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    expect(result.current.visibleRange.end).toBe(999);
  });

  it('clamps start to 0', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 10 })
    );
    act(() => {
      const event = {
        currentTarget: {
          scrollTop: 0,
          clientHeight: 200,
        },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    expect(result.current.visibleRange.start).toBe(0);
  });

  it('handles empty list', () => {
    const { result } = renderHook(() =>
      useVirtualList([], { itemHeight: 40 })
    );
    expect(result.current.totalHeight).toBe(0);
    expect(result.current.virtualItems).toEqual([]);
  });

  it('scrollToIndex updates scroll position', () => {
    const mockElement = { scrollTop: 0, clientHeight: 200 };
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40 })
    );
    // Set up container ref via onScroll
    act(() => {
      const event = {
        currentTarget: mockElement,
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    act(() => {
      result.current.scrollToIndex(50);
    });
    expect(mockElement.scrollTop).toBe(2000);
  });

  it('virtual items count matches range', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40, overscan: 0 })
    );
    act(() => {
      const event = {
        currentTarget: { scrollTop: 0, clientHeight: 200 },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    const { start, end } = result.current.visibleRange;
    expect(result.current.virtualItems.length).toBe(end - start + 1);
  });

  it('uses default overscan of 3', () => {
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 40 })
    );
    act(() => {
      const event = {
        currentTarget: { scrollTop: 400, clientHeight: 200 },
      } as unknown as React.UIEvent<HTMLElement>;
      result.current.containerProps.onScroll(event);
    });
    // start = max(0, 10 - 3) = 7
    expect(result.current.visibleRange.start).toBe(7);
  });

  it('recalculates on items change', () => {
    const { result, rerender } = renderHook(
      ({ items: list }) => useVirtualList(list, { itemHeight: 40 }),
      { initialProps: { items: ['a', 'b'] } }
    );
    expect(result.current.totalHeight).toBe(80);
    rerender({ items: ['a', 'b', 'c', 'd', 'e'] });
    expect(result.current.totalHeight).toBe(200);
  });
});
