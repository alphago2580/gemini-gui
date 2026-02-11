import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseScrollLockResult {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
  toggle: () => void;
}

/**
 * Hook that locks/unlocks scrolling on the document body.
 * Useful for modals, drawers, and other overlay components.
 * Preserves scroll position and restores it when unlocked.
 */
export function useScrollLock(initialLocked = false): UseScrollLockResult {
  const [isLocked, setIsLocked] = useState(initialLocked);
  const scrollY = useRef(0);
  const originalOverflow = useRef('');

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const toggle = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isLocked) {
      scrollY.current = window.scrollY;
      originalOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow.current;
      window.scrollTo(0, scrollY.current);
    }

    return () => {
      document.body.style.overflow = originalOverflow.current;
    };
  }, [isLocked]);

  return { isLocked, lock, unlock, toggle };
}
