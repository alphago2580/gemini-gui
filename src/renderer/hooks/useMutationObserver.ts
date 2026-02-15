import { useEffect, useMemo, useRef } from 'react';

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

  const serializedOptions = JSON.stringify(options);
  const stableOptions = useMemo<MutationObserverInit>(
    () => JSON.parse(serializedOptions) as MutationObserverInit,
    [serializedOptions],
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new MutationObserver((mutations) => {
      callbackRef.current(mutations);
    });

    observer.observe(target, stableOptions);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, stableOptions]);
}
