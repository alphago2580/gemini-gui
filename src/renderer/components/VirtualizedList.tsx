import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import './VirtualizedList.css';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  label?: string;
  id?: string;
  className?: string;
}

interface ScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
}

function VirtualizedListInner<T>(
  props: VirtualizedListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement {
  const {
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 3,
    keyExtractor,
    onEndReached,
    endReachedThreshold = 0.8,
    label,
    id,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const onEndReachedRef = useRef(onEndReached);
  const endReachedFiredRef = useRef(false);
  const rafIdRef = useRef<number | undefined>(undefined);

  onEndReachedRef.current = onEndReached;

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  const calcRange = useCallback((scrollTop: number): ScrollState => {
    const rawStart = Math.floor(scrollTop / itemHeight);
    const startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(items.length - 1, rawStart + visibleCount + overscan);
    return { scrollTop, startIndex, endIndex };
  }, [itemHeight, items.length, visibleCount, overscan]);

  const [scrollState, setScrollState] = useState<ScrollState>(() => calcRange(0));

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setScrollState(calcRange(containerRef.current?.scrollTop ?? 0));
  }, [calcRange]);

  const handleScroll = useCallback(() => {
    if (rafIdRef.current !== undefined) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = undefined;
      const el = containerRef.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      setScrollState(calcRange(scrollTop));

      if (onEndReachedRef.current && items.length > 0) {
        const scrollRatio = (scrollTop + containerHeight) / totalHeight;
        if (scrollRatio >= endReachedThreshold) {
          if (!endReachedFiredRef.current) {
            endReachedFiredRef.current = true;
            onEndReachedRef.current();
          }
        } else {
          endReachedFiredRef.current = false;
        }
      }
    });
  }, [calcRange, containerHeight, totalHeight, endReachedThreshold, items.length]);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; key: string }[] = [];
    for (let i = scrollState.startIndex; i <= scrollState.endIndex && i < items.length; i++) {
      const item = items[i];
      const key = keyExtractor ? keyExtractor(item, i) : String(i);
      result.push({ item, index: i, key });
    }
    return result;
  }, [items, scrollState.startIndex, scrollState.endIndex, keyExtractor]);

  const setRefs = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [ref]);

  const containerClasses = ['virtualized-list', className].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      ref={setRefs}
      className={containerClasses}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      role="list"
      aria-label={label || '가상 스크롤 목록'}
      aria-rowcount={items.length}
    >
      <div
        className="virtualized-list-inner"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            className="virtualized-list-item"
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              left: 0,
              right: 0,
            }}
            role="listitem"
            aria-rowindex={index + 1}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

const VirtualizedList = React.memo(React.forwardRef(VirtualizedListInner)) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export default VirtualizedList;
