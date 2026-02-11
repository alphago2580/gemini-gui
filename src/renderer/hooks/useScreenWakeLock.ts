import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseScreenWakeLockOptions {
  /** Automatically request wake lock on mount */
  autoRequest?: boolean;
  /** Called when wake lock is acquired */
  onAcquire?: () => void;
  /** Called when wake lock is released */
  onRelease?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseScreenWakeLockResult {
  /** Whether a wake lock is currently active */
  isActive: boolean;
  /** Request a screen wake lock */
  request: () => Promise<void>;
  /** Release the wake lock */
  release: () => Promise<void>;
  /** Whether the browser supports Screen Wake Lock API */
  isSupported: boolean;
  /** Error if the last operation failed */
  error: Error | null;
}

export function useScreenWakeLock(options: UseScreenWakeLockOptions = {}): UseScreenWakeLockResult {
  const { autoRequest = false, onAcquire, onRelease, onError } = options;
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const onAcquireRef = useRef(onAcquire);
  onAcquireRef.current = onAcquire;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const isSupported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const request = useCallback(async () => {
    if (!isSupported) {
      const err = new Error('Screen Wake Lock API is not supported');
      setError(err);
      onErrorRef.current?.(err);
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);
      setError(null);
      onAcquireRef.current?.();

      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null;
        setIsActive(false);
        onReleaseRef.current?.();
      });
    } catch (err) {
      const lockError = err instanceof Error ? err : new Error(String(err));
      setError(lockError);
      onErrorRef.current?.(lockError);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
      } catch (err) {
        const releaseError = err instanceof Error ? err : new Error(String(err));
        setError(releaseError);
        onErrorRef.current?.(releaseError);
      }
    }
  }, []);

  // Re-acquire on visibility change (browser releases wake lock on tab switch)
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null && isActive) {
        try {
          const sentinel = await navigator.wakeLock.request('screen');
          wakeLockRef.current = sentinel;
          sentinel.addEventListener('release', () => {
            wakeLockRef.current = null;
            setIsActive(false);
            onReleaseRef.current?.();
          });
        } catch {
          // Silent fail on re-acquire
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, isActive]);

  // Auto request
  useEffect(() => {
    if (autoRequest && isSupported) {
      request();
    }
  }, [autoRequest, isSupported, request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return { isActive, request, release, isSupported, error };
}
