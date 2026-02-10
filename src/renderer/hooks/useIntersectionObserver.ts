import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export interface IntersectionObserverEntry {
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: DOMRectReadOnly | null;
}

const DEFAULT_ENTRY: IntersectionObserverEntry = {
  isIntersecting: false,
  intersectionRatio: 0,
  boundingClientRect: null,
};

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): {
  ref: React.RefObject<Element | null>;
  entry: IntersectionObserverEntry;
  isVisible: boolean;
} {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;

  const elementRef = useRef<Element | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>(DEFAULT_ENTRY);
  const frozenRef = useRef(false);

  const updateEntry = useCallback(
    (entries: globalThis.IntersectionObserverEntry[]) => {
      const [e] = entries;
      if (!e) return;

      if (frozenRef.current) return;

      const newEntry: IntersectionObserverEntry = {
        isIntersecting: e.isIntersecting,
        intersectionRatio: e.intersectionRatio,
        boundingClientRect: e.boundingClientRect,
      };

      setEntry(newEntry);

      if (freezeOnceVisible && e.isIntersecting) {
        frozenRef.current = true;
      }
    },
    [freezeOnceVisible]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, updateEntry]);

  return {
    ref: elementRef,
    entry,
    isVisible: entry.isIntersecting,
  };
}
