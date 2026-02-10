import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseIdleOptions {
  /** Time in ms before user is considered idle. Default: 60000 (1 minute) */
  timeout?: number;
  /** Events that reset the idle timer. Default: common interaction events */
  events?: string[];
  /** Called when user becomes idle */
  onIdle?: () => void;
  /** Called when user becomes active after being idle */
  onActive?: () => void;
}

const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
];

export interface UseIdleReturn {
  isIdle: boolean;
  /** Time in ms since last activity */
  lastActiveTime: number;
  /** Manually reset the idle timer */
  reset: () => void;
}

/**
 * useIdle - Detects user inactivity based on DOM events.
 */
export function useIdle(options: UseIdleOptions = {}): UseIdleReturn {
  const { timeout = 60000, events = DEFAULT_EVENTS, onIdle, onActive } = options;
  const [isIdle, setIsIdle] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    setLastActiveTime(Date.now());
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      onActive?.();
    }
    timerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  }, [timeout, onIdle, onActive]);

  useEffect(() => {
    // Start initial timer
    timerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
      onIdle?.();
    }, timeout);

    const handleActivity = () => {
      reset();
    };

    for (const event of events) {
      document.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, handleActivity);
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [events, timeout, onIdle, reset]);

  return { isIdle, lastActiveTime, reset };
}
