import { useState, useEffect, useCallback, useRef } from 'react';

interface UseReadingProgressOptions {
  /** Throttle scroll events by this many ms (default: 50) */
  throttleMs?: number;
  /** Element to track scroll on. If not provided, tracks window scroll */
  containerRef?: React.RefObject<HTMLElement>;
}

interface UseReadingProgressResult {
  /** Scroll progress as a percentage 0-100 */
  progress: number;
  /** Whether the user has scrolled past the top (useful for showing the bar) */
  isVisible: boolean;
  /** Reset progress to 0 */
  reset: () => void;
}

/**
 * Track reading progress (scroll percentage) of a container or window.
 * Returns progress (0-100) and visibility flag.
 */
export function useReadingProgress(options: UseReadingProgressOptions = {}): UseReadingProgressResult {
  const { throttleMs = 50, containerRef } = options;
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const lastCallRef = useRef(0);

  const calculateProgress = useCallback(() => {
    if (containerRef?.current) {
      const el = containerRef.current;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        setIsVisible(false);
        return;
      }
      const pct = Math.round((scrollTop / scrollHeight) * 100);
      setProgress(Math.min(100, Math.max(0, pct)));
      setIsVisible(scrollTop > 0);
    } else {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        setIsVisible(false);
        return;
      }
      const pct = Math.round((scrollTop / scrollHeight) * 100);
      setProgress(Math.min(100, Math.max(0, pct)));
      setIsVisible(scrollTop > 0);
    }
  }, [containerRef]);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastCallRef.current >= throttleMs) {
      lastCallRef.current = now;
      calculateProgress();
    }
  }, [throttleMs, calculateProgress]);

  useEffect(() => {
    const target = containerRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    // Calculate initial state
    calculateProgress();
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, handleScroll, calculateProgress]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsVisible(false);
  }, []);

  return { progress, isVisible, reset };
}
