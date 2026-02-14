import { useState, useCallback, useRef, useEffect } from 'react';

export type VibrationPattern = number | number[];

export interface UseVibrationReturn {
  isSupported: boolean;
  isVibrating: boolean;
  vibrate: (pattern?: VibrationPattern) => boolean;
  stop: () => void;
}

function checkSupport(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function useVibration(): UseVibrationReturn {
  const isSupported = checkSupport();
  const [isVibrating, setIsVibrating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const vibrate = useCallback((pattern: VibrationPattern = 200): boolean => {
    if (!checkSupport()) return false;

    const success = navigator.vibrate(pattern);
    if (success) {
      setIsVibrating(true);

      const duration = Array.isArray(pattern)
        ? pattern.reduce((sum, val) => sum + val, 0)
        : pattern;

      if (duration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsVibrating(false), duration);
      }
    }
    return success;
  }, [isSupported]);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (checkSupport()) {
      navigator.vibrate(0);
    }
    setIsVibrating(false);
  }, [isSupported]);

  return { isSupported, isVibrating, vibrate, stop };
}
