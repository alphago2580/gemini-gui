import { useState, useCallback, useMemo, useRef } from 'react';

export interface UseVirtualListOptions {
  itemHeight: number;
  overscan?: number;
}

export interface VirtualItem {
  index: number;
  offsetTop: number;
}

export interface UseVirtualListResult<T> {
  virtualItems: VirtualItem[];
  totalHeight: number;
  containerProps: {
    onScroll: (e: React.UIEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  wrapperProps: {
    style: React.CSSProperties;
  };
  scrollToIndex: (index: number) => void;
  visibleRange: { start: number; end: number };
}

export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
): UseVirtualListResult<T> {
  const { itemHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + 2 * overscan);
    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  const virtualItems = useMemo(() => {
    const result: VirtualItem[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({ index: i, offsetTop: i * itemHeight });
    }
    return result;
  }, [visibleRange, itemHeight]);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    containerRef.current = target;
    setScrollTop(target.scrollTop);
    if (containerHeight !== target.clientHeight) {
      setContainerHeight(target.clientHeight);
    }
  }, [containerHeight]);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  const containerProps = useMemo(() => ({
    onScroll,
    style: { overflow: 'auto' as const, position: 'relative' as const },
  }), [onScroll]);

  const wrapperProps = useMemo(() => ({
    style: { height: totalHeight, position: 'relative' as const },
  }), [totalHeight]);

  return {
    virtualItems,
    totalHeight,
    containerProps,
    wrapperProps,
    scrollToIndex,
    visibleRange,
  };
}
