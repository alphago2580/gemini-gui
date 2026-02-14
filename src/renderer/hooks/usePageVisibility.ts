import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

export interface UsePageVisibilityOptions {
  onVisible?: () => void;
  onHidden?: () => void;
}

export interface UsePageVisibilityReturn {
  isVisible: boolean;
  lastVisibleTime: number | null;
  lastHiddenTime: number | null;
  hiddenDuration: number;
}

export function usePageVisibility(options: UsePageVisibilityOptions = {}): UsePageVisibilityReturn {
  const { onVisible, onHidden } = options;
  const [isVisible, setIsVisible] = useState(() => !document.hidden);
  const [lastVisibleTime, setLastVisibleTime] = useState<number | null>(null);
  const [lastHiddenTime, setLastHiddenTime] = useState<number | null>(null);
  const [hiddenDuration, setHiddenDuration] = useState(0);
  const hiddenStartRef = useRef<number | null>(null);

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden;
    setIsVisible(visible);

    const now = Date.now();

    if (visible) {
      setLastVisibleTime(now);
      if (hiddenStartRef.current !== null) {
        setHiddenDuration(now - hiddenStartRef.current);
        hiddenStartRef.current = null;
      }
      onVisibleRef.current?.();
    } else {
      setLastHiddenTime(now);
      hiddenStartRef.current = now;
      onHiddenRef.current?.();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return useMemo(() => ({
    isVisible,
    lastVisibleTime,
    lastHiddenTime,
    hiddenDuration,
  }), [isVisible, lastVisibleTime, lastHiddenTime, hiddenDuration]);
}
