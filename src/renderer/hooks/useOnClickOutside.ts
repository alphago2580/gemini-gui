import { useEffect, useRef } from 'react';

export function useOnClickOutside<T extends HTMLElement>(
  handler: () => void,
  active: boolean = true
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      savedHandler.current();
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [active]);

  return ref;
}
