import { useCallback, useRef, useEffect } from 'react';

export interface DebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedCallbackReturn<T extends (...args: unknown[]) => void> {
  callback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
}

/**
 * Returns a debounced version of the callback function.
 *
 * Unlike useDebounce (which debounces a value), this hook debounces
 * the invocation of a callback — useful for search handlers, API calls, etc.
 *
 * Supports leading/trailing edge execution and an optional maxWait
 * that guarantees the callback fires at least once within maxWait ms.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  options: DebounceOptions,
): DebouncedCallbackReturn<T> {
  const { delay, leading = false, trailing = true, maxWait } = options;

  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const isPendingRef = useRef(false);
  const leadingCalledRef = useRef(false);

  fnRef.current = fn;

  const invoke = useCallback(() => {
    if (lastArgsRef.current !== null) {
      fnRef.current(...lastArgsRef.current);
      lastArgsRef.current = null;
    }
    isPendingRef.current = false;
    leadingCalledRef.current = false;

    if (maxTimerRef.current !== null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current !== null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    lastArgsRef.current = null;
    isPendingRef.current = false;
    leadingCalledRef.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    invoke();
  }, [invoke]);

  const callback = useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;
    isPendingRef.current = true;

    // Leading edge: fire immediately on first call
    if (leading && !leadingCalledRef.current) {
      leadingCalledRef.current = true;
      fnRef.current(...args);
      lastArgsRef.current = null;

      // Start maxWait timer if configured
      if (maxWait !== undefined && maxWait > 0 && maxTimerRef.current === null) {
        maxTimerRef.current = setTimeout(() => {
          maxTimerRef.current = null;
          if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          invoke();
        }, maxWait);
      }

      // If trailing is also enabled, set trailing timer
      if (trailing) {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          invoke();
        }, delay);
      } else {
        isPendingRef.current = false;
      }
      return;
    }

    // Clear existing trailing timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // Start maxWait timer if not already running
    if (maxWait !== undefined && maxWait > 0 && maxTimerRef.current === null) {
      maxTimerRef.current = setTimeout(() => {
        maxTimerRef.current = null;
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        invoke();
      }, maxWait);
    }

    // Set trailing timer
    if (trailing) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        invoke();
      }, delay);
    }
  }, [delay, leading, trailing, maxWait, invoke]);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    callback,
    cancel,
    flush,
    get isPending() {
      return isPendingRef.current;
    },
  };
}
