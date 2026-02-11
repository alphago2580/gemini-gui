import { useCallback, useRef, useEffect } from 'react';

export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledCallbackReturn<T extends (...args: unknown[]) => void> {
  callback: (...args: Parameters<T>) => void;
  cancel: () => void;
  isPending: boolean;
}

export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  options: ThrottleOptions
): ThrottledCallbackReturn<T> {
  const { delay, leading = true, trailing = true } = options;

  const fnRef = useRef(fn);
  const lastCallTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const isPendingRef = useRef(false);

  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastArgsRef.current = null;
    isPendingRef.current = false;
  }, []);

  const callback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastCallTime.current;

    lastArgsRef.current = args;

    if (elapsed >= delay) {
      if (leading) {
        lastCallTime.current = now;
        fnRef.current(...args);
        lastArgsRef.current = null;
      } else {
        isPendingRef.current = true;
        if (timerRef.current === null && trailing) {
          timerRef.current = setTimeout(() => {
            lastCallTime.current = Date.now();
            timerRef.current = null;
            isPendingRef.current = false;
            if (lastArgsRef.current !== null) {
              fnRef.current(...lastArgsRef.current);
              lastArgsRef.current = null;
            }
          }, delay);
        }
      }
    } else {
      isPendingRef.current = true;
      if (timerRef.current === null && trailing) {
        const remaining = delay - elapsed;
        timerRef.current = setTimeout(() => {
          lastCallTime.current = Date.now();
          timerRef.current = null;
          isPendingRef.current = false;
          if (lastArgsRef.current !== null) {
            fnRef.current(...lastArgsRef.current);
            lastArgsRef.current = null;
          }
        }, remaining);
      }
    }
  }, [delay, leading, trailing]);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    callback,
    cancel,
    get isPending() {
      return isPendingRef.current;
    },
  };
}
