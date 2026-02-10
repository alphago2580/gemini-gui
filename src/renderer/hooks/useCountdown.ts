import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseCountdownReturn {
  secondsLeft: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useCountdown(onComplete?: () => void): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setSecondsLeft(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [secondsLeft, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    setIsRunning(false);
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { secondsLeft, isRunning, start, pause, resume, reset };
}
