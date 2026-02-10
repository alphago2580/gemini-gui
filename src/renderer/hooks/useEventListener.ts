import { useEffect, useRef } from 'react';

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;

export function useEventListener<K extends keyof EventMap>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  element?: HTMLElement | Window | Document | null,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element === undefined ? window : element;
    if (!target || !target.addEventListener) return;

    const eventListener = (event: Event) => savedHandler.current(event as EventMap[K]);

    target.addEventListener(eventName, eventListener, options);
    return () => target.removeEventListener(eventName, eventListener, options);
  }, [eventName, element, options]);
}
