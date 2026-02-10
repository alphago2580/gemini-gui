import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';

export interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollHeight: number;
  clientHeight: number;
}

const BOTTOM_THRESHOLD = 10;

/**
 * Hook that tracks scroll position, direction, and boundary state of an element or window.
 */
export function useScrollPosition(
  elementRef?: RefObject<HTMLElement | null>,
  throttleMs = 100
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false,
    scrollHeight: 0,
    clientHeight: 0,
  });

  const lastY = useRef(0);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (throttleTimer.current) return;

    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;

      const el = elementRef?.current;
      const scrollX = el ? el.scrollLeft : window.scrollX;
      const scrollY = el ? el.scrollTop : window.scrollY;
      const scrollHeight = el ? el.scrollHeight : document.documentElement.scrollHeight;
      const clientHeight = el ? el.clientHeight : window.innerHeight;

      const direction: 'up' | 'down' | 'none' =
        scrollY > lastY.current ? 'down' : scrollY < lastY.current ? 'up' : 'none';

      lastY.current = scrollY;

      setPosition({
        x: scrollX,
        y: scrollY,
        direction,
        isAtTop: scrollY <= 0,
        isAtBottom: scrollY + clientHeight >= scrollHeight - BOTTOM_THRESHOLD,
        scrollHeight,
        clientHeight,
      });
    }, throttleMs);
  }, [elementRef, throttleMs]);

  useEffect(() => {
    const target = elementRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    // Initial position
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [elementRef, handleScroll]);

  return position;
}
