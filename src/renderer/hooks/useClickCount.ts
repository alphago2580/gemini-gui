import { useState, useCallback, useRef, type RefObject } from 'react';

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

  const handleClick = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastClickTime.current;

    if (elapsed <= thresholdMs && lastClickTime.current > 0) {
      setCount((prev) => prev + 1);
    } else {
      setCount(1);
    }

    lastClickTime.current = now;
  }, [thresholdMs]);

  // Attach listener if elementRef provided, otherwise caller must wire handleClick
  const clickRef = useRef(handleClick);
  clickRef.current = handleClick;

  // We use the ref callback pattern for the element
  const attachedRef = useRef<HTMLElement | null>(null);

  // Sync with elementRef
  if (elementRef) {
    const el = elementRef.current;
    if (el !== attachedRef.current) {
      if (attachedRef.current) {
        attachedRef.current.removeEventListener('click', clickRef.current);
      }
      if (el) {
        el.addEventListener('click', clickRef.current);
      }
      attachedRef.current = el;
    }
  }

  const clickType: ClickType =
    count >= 3 ? 'triple' : count === 2 ? 'double' : 'single';

  return { count, clickType, reset };
}
