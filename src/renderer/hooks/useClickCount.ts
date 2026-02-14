import { useState, useCallback, useRef, useEffect, type RefObject } from 'react';

export type ClickType = 'single' | 'double' | 'triple';

export interface ClickCountResult {
  count: number;
  clickType: ClickType;
  reset: () => void;
}

/**
 * Hook that tracks click count and detects single/double/triple clicks.
 * Clicks within the threshold time window are counted together.
 * After the threshold, the count resets on the next click.
 */
export function useClickCount(
  elementRef?: RefObject<HTMLElement | null>,
  thresholdMs = 300
): ClickCountResult {
  const [count, setCount] = useState(0);
  const lastClickTime = useRef(0);

  const reset = useCallback(() => {
    setCount(0);
    lastClickTime.current = 0;
  }, []);

  const handleClickRef = useRef<() => void>(() => {});
  handleClickRef.current = () => {
    const now = Date.now();
    const elapsed = now - lastClickTime.current;

    if (elapsed <= thresholdMs && lastClickTime.current > 0) {
      setCount((prev) => prev + 1);
    } else {
      setCount(1);
    }

    lastClickTime.current = now;
  };

  // Attach/detach event listener via useEffect for proper cleanup
  useEffect(() => {
    const el = elementRef?.current;
    if (!el) return;

    const handler = () => handleClickRef.current();
    el.addEventListener('click', handler);
    return () => {
      el.removeEventListener('click', handler);
    };
  }, [elementRef?.current]);

  const clickType: ClickType =
    count >= 3 ? 'triple' : count === 2 ? 'double' : 'single';

  return { count, clickType, reset };
}
