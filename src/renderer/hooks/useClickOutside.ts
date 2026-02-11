import { useEffect, useRef, useCallback } from 'react';

export interface UseClickOutsideOptions {
  enabled?: boolean;
  eventType?: 'mousedown' | 'mouseup' | 'click';
  ignoreRefs?: React.RefObject<HTMLElement | null>[];
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  options: UseClickOutsideOptions = {}
): React.RefObject<T | null> {
  const { enabled = true, eventType = 'mousedown', ignoreRefs = [] } = options;
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handleEvent = useCallback(
    (event: Event) => {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        const isIgnored = ignoreRefs.some(
          ignoreRef => ignoreRef.current && ignoreRef.current.contains(target)
        );
        if (!isIgnored) {
          callbackRef.current();
        }
      }
    },
    [ignoreRefs]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener(eventType, handleEvent);
    return () => {
      document.removeEventListener(eventType, handleEvent);
    };
  }, [enabled, eventType, handleEvent]);

  return ref;
}
