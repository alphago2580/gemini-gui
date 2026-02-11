import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseOnlineStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
}

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  since: number | null;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}): UseOnlineStatusReturn {
  const { onOnline, onOffline } = options;
  const onOnlineRef = useRef(onOnline);
  onOnlineRef.current = onOnline;
  const onOfflineRef = useRef(onOffline);
  onOfflineRef.current = onOffline;

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [since, setSince] = useState<number | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setSince(Date.now());
    onOnlineRef.current?.();
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setSince(Date.now());
    onOfflineRef.current?.();
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    since,
  };
}
