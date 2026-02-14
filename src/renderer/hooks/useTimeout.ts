import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseTimeoutReturn {
  /** Whether the timeout is currently pending */
  isPending: boolean;
  /** Cancel the timeout */
  clear: () => void;
  /** Reset the timeout (restart from the beginning) */
  reset: () => void;
}

/**
 * Declarative setTimeout hook with auto-cleanup.
 * Pass `delay: null` to pause/disable the timeout.
 * The callback always sees the latest closure without restarting the timer.
 */
export function useTimeout(
  callback: () => void,
  delay: number | null
): UseTimeoutReturn {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, setIsPending] = useState(delay !== null);

  // Always keep the latest callback in the ref
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPending(false);
  }, []);

  const set = useCallback((ms: number) => {
    clear();
    setIsPending(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsPending(false);
      savedCallback.current();
    }, ms);
  }, [clear]);

  // Start/restart the timeout when delay changes
  useEffect(() => {
    if (delay === null) {
      clear();
      return;
    }

    set(delay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    if (delay !== null) {
      set(delay);
    }
  }, [delay, set]);

  return { isPending, clear, reset };
}
