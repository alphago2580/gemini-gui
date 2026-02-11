import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseStickyOptions {
  /** Offset from top in pixels at which element becomes sticky (default: 0) */
  offset?: number;
  /** Whether the hook is active (default: true) */
  enabled?: boolean;
}

export interface UseStickyResult {
  /** Whether the element is currently stuck */
  isSticky: boolean;
  /** Ref to attach to the sentinel element placed before the sticky element */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  /** Current scroll position */
  scrollY: number;
}

export function useSticky(options: UseStickyOptions = {}): UseStickyResult {
  const { offset = 0, enabled = true } = options;

  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        setIsSticky(!entry.isIntersecting);
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      setIsSticky(false);
      return;
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: `-${offset}px 0px 0px 0px`,
    });

    observerRef.current.observe(sentinel);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [enabled, offset, handleIntersection]);

  return { isSticky, sentinelRef, scrollY };
}
