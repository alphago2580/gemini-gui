import { useEffect, useRef } from 'react';

/**
 * Observes DOM mutations on a target element using MutationObserver.
 * Calls the callback with MutationRecord[] when mutations match the options.
 */
export function useMutationObserver(
  targetRef: React.RefObject<HTMLElement | null>,
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = { childList: true }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new MutationObserver((mutations) => {
      callbackRef.current(mutations);
    });

    observer.observe(target, options);

    return () => {
      observer.disconnect();
    };
    // Stringify options for stable dependency comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, JSON.stringify(options)]);
}
