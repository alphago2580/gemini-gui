import { useState, useCallback, useRef, useEffect } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeReturn extends ElementSize {
  ref: React.RefCallback<HTMLElement>;
}

export function useElementSize(): UseElementSizeReturn {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      disconnect();

      if (!element) {
        elementRef.current = null;
        return;
      }

      elementRef.current = element;

      observerRef.current = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });

      observerRef.current.observe(element);

      // Set initial size
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    },
    [disconnect]
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ref,
    width: size.width,
    height: size.height,
  };
}
