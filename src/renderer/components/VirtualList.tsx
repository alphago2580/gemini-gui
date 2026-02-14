import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import './VirtualList.css';

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels (fixed height mode) */
  itemHeight: number;
  /** Height of the viewport container in pixels */
  height: number;
  /** Width of the container (default: '100%') */
  width?: string | number;
  /** Number of extra items to render above/below the viewport */
  overscan?: number;
  /** Render function for each visible item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional key extractor (defaults to index) */
  getItemKey?: (item: T, index: number) => string | number;
  /** Custom className for the outer container */
  className?: string;
  /** ARIA label for the list */
  ariaLabel?: string;
  /** ARIA role for the list (default: 'list') */
  role?: string;
  /** ARIA role for each item (default: 'listitem') */
  itemRole?: string;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  /** Callback when visible range changes */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
  /** Whether to scroll to bottom when items change */
  scrollToBottom?: boolean;
}

interface VisibleRange {
  start: number;
  end: number;
}

function calculateRange(
  scrollTop: number,
  height: number,
  itemHeight: number,
  itemCount: number,
  overscan: number
): VisibleRange {
  const startVisible = Math.floor(scrollTop / itemHeight);
  const endVisible = Math.ceil((scrollTop + height) / itemHeight);

  const start = Math.max(0, startVisible - overscan);
  const end = Math.min(itemCount, endVisible + overscan);

  return { start, end };
}

function VirtualListInner<T>(
  props: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
): React.ReactElement {
  const {
    items,
    itemHeight,
    height,
    width = '100%',
    overscan = 3,
    renderItem,
    getItemKey,
    className,
    ariaLabel = '가상 스크롤 목록',
    role = 'list',
    itemRole = 'listitem',
    onScroll,
    onVisibleRangeChange,
    scrollToBottom = false,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const prevItemCountRef = useRef(items.length);

  // Expose the container ref via forwarded ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(containerRef.current);
    } else {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
    }
  }, [ref]);

  const totalHeight = items.length * itemHeight;

  const range = useMemo(
    () => calculateRange(scrollTop, height, itemHeight, items.length, overscan),
    [scrollTop, height, itemHeight, items.length, overscan]
  );

  // Notify about visible range changes
  const prevRangeRef = useRef<VisibleRange>({ start: 0, end: 0 });
  useEffect(() => {
    if (
      onVisibleRangeChange &&
      (prevRangeRef.current.start !== range.start || prevRangeRef.current.end !== range.end)
    ) {
      prevRangeRef.current = range;
      onVisibleRangeChange(range.start, range.end);
    }
  }, [range, onVisibleRangeChange]);

  // Scroll to bottom when items are appended
  useEffect(() => {
    if (scrollToBottom && items.length > prevItemCountRef.current && containerRef.current) {
      const maxScroll = totalHeight - height;
      if (maxScroll > 0) {
        containerRef.current.scrollTop = maxScroll;
      }
    }
    prevItemCountRef.current = items.length;
  }, [items.length, scrollToBottom, totalHeight, height]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  const visibleItems = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let i = range.start; i < range.end; i++) {
      const item = items[i];
      const key = getItemKey ? getItemKey(item, i) : i;
      result.push(
        <div
          key={key}
          className="virtual-list-item"
          role={itemRole}
          style={{
            position: 'absolute',
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
          data-index={i}
        >
          {renderItem(item, i)}
        </div>
      );
    }
    return result;
  }, [range, items, itemHeight, renderItem, getItemKey, itemRole]);

  const containerClass = ['virtual-list', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ height, width, overflow: 'auto' }}
      onScroll={handleScroll}
      role={role}
      aria-label={ariaLabel}
      aria-rowcount={items.length}
    >
      <div
        className="virtual-list-inner"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// Use forwardRef with generic support
const VirtualList = React.memo(React.forwardRef(VirtualListInner)) as <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export default VirtualList;
