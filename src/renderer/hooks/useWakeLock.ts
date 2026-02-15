import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
  type: 'screen' | null;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const releaseHandlerRef = useRef<(() => void) | null>(null);

  const request = useCallback(async () => {
    if (!isSupported) return;

    try {
      // Remove previous listener if re-requesting
      if (wakeLockRef.current && releaseHandlerRef.current) {
        wakeLockRef.current.removeEventListener('release', releaseHandlerRef.current);
      }

      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);

      const handleRelease = () => {
        wakeLockRef.current = null;
        setIsActive(false);
      };
      releaseHandlerRef.current = handleRelease;
      sentinel.addEventListener('release', handleRelease);
    } catch {
      setIsActive(false);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        if (releaseHandlerRef.current) {
          wakeLockRef.current.removeEventListener('release', releaseHandlerRef.current);
          releaseHandlerRef.current = null;
        }
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    request,
    release,
    type: isActive ? 'screen' : null,
  };
}
