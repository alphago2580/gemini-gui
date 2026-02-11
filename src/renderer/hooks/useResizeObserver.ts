import { useEffect, useRef, useState, useCallback } from 'react';

export interface ResizeObserverSize {
  width: number;
  height: number;
  inlineSize: number;
  blockSize: number;
}

const DEFAULT_SIZE: ResizeObserverSize = {
  width: 0,
  height: 0,
  inlineSize: 0,
  blockSize: 0,
};

export interface UseResizeObserverOptions {
  box?: ResizeObserverBoxOptions;
  onResize?: (size: ResizeObserverSize) => void;
}

export function useResizeObserver(
  options: UseResizeObserverOptions = {}
): {
  ref: React.RefObject<Element | null>;
  size: ResizeObserverSize;
  width: number;
  height: number;
} {
  const { box, onResize } = options;

  const elementRef = useRef<Element | null>(null);
  const [size, setSize] = useState<ResizeObserverSize>(DEFAULT_SIZE);
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;

    const { width, height } = entry.contentRect;
    const borderBoxSize = entry.borderBoxSize?.[0];
    const contentBoxSize = entry.contentBoxSize?.[0];

    const inlineSize = borderBoxSize?.inlineSize ?? contentBoxSize?.inlineSize ?? width;
    const blockSize = borderBoxSize?.blockSize ?? contentBoxSize?.blockSize ?? height;

    const newSize: ResizeObserverSize = {
      width,
      height,
      inlineSize,
      blockSize,
    };

    setSize(newSize);
    onResizeRef.current?.(newSize);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (typeof ResizeObserver === 'undefined') return;

    const observerOptions: ResizeObserverOptions = box ? { box } : {};
    const observer = new ResizeObserver(handleResize);
    observer.observe(element, observerOptions);

    return () => {
      observer.disconnect();
    };
  }, [box, handleResize]);

  return {
    ref: elementRef,
    size,
    width: size.width,
    height: size.height,
  };
}
