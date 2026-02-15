import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import './MasonryGrid.css';
import * as S from '../constants/strings';

export interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  minColumnWidth?: number;
  label?: string;
  animate?: boolean;
}

const DEFAULT_COLUMNS = 3;
const DEFAULT_GAP = 16;
const DEFAULT_MIN_COLUMN_WIDTH = 200;

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns: columnsProp,
  gap = DEFAULT_GAP,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
  label,
  animate = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoColumns, setAutoColumns] = useState(columnsProp ?? DEFAULT_COLUMNS);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const columnCount = columnsProp ?? autoColumns;

  // Auto-calculate columns based on container width
  const updateAutoColumns = useCallback(() => {
    if (columnsProp !== undefined || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)));
    setAutoColumns(cols);
  }, [columnsProp, gap, minColumnWidth]);

  useEffect(() => {
    updateAutoColumns();

    const container = containerRef.current;
    if (!container) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      updateAutoColumns();
    });
    resizeObserverRef.current.observe(container);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [updateAutoColumns]);

  // Measure item heights for better distribution
  const measureItems = useCallback(() => {
    const newHeights = new Map<number, number>();
    itemRefs.current.forEach((el, index) => {
      if (el) {
        newHeights.set(index, el.getBoundingClientRect().height);
      }
    });
    setMeasuredHeights(newHeights);
  }, []);

  useEffect(() => {
    // Measure after initial render
    const frame = requestAnimationFrame(measureItems);
    return () => cancelAnimationFrame(frame);
  }, [measureItems, children.length]);

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  // Distribute items with measured heights
  const layout = useMemo(() => {
    const cols: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
    const colHeights: number[] = new Array(columnCount).fill(0);

    const childArray = React.Children.toArray(children);

    childArray.forEach((child, index) => {
      // Find shortest column
      let shortestIndex = 0;
      for (let i = 1; i < columnCount; i++) {
        if (colHeights[i] < colHeights[shortestIndex]) {
          shortestIndex = i;
        }
      }

      const wrappedChild = (
        <div
          key={index}
          className={`masonry-grid-item${animate ? ' masonry-grid-item--animated' : ''}`}
          ref={setItemRef(index)}
          style={{ marginBottom: `${gap}px` }}
        >
          {child}
        </div>
      );

      cols[shortestIndex].push(wrappedChild);

      // Use measured height if available, otherwise estimate
      const height = measuredHeights.get(index) ?? 100;
      colHeights[shortestIndex] += height + gap;
    });

    return cols;
  }, [children, columnCount, gap, animate, measuredHeights, setItemRef]);

  const childArray = React.Children.toArray(children);

  if (childArray.length === 0) {
    return (
      <div
        className="masonry-grid masonry-grid--empty"
        role="grid"
        aria-label={label || S.MASONRY_GRID_ARIA}
      />
    );
  }

  return (
    <div
      className="masonry-grid"
      role="grid"
      aria-label={label || S.MASONRY_GRID_ARIA}
      ref={containerRef}
      style={{ gap: `${gap}px` }}
    >
      {layout.map((column, colIndex) => (
        <div
          key={colIndex}
          className="masonry-grid-column"
          role="row"
          aria-label={S.MASONRY_GRID_COLUMN_ARIA(colIndex + 1)}
          style={{ flex: 1 }}
        >
          {column}
        </div>
      ))}
    </div>
  );
};

export default React.memo(MasonryGrid);
