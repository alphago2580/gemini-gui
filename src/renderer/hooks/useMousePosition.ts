import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  isInside: boolean;
}

const INITIAL_POSITION: MousePosition = {
  x: 0,
  y: 0,
  elementX: 0,
  elementY: 0,
  isInside: false,
};

/**
 * Hook that tracks mouse position relative to the window or a specific element.
 * Returns both absolute (page) and element-relative coordinates.
 */
export function useMousePosition(
  elementRef?: RefObject<HTMLElement | null>,
  throttleMs = 0
): MousePosition {
  const [position, setPosition] = useState<MousePosition>(INITIAL_POSITION);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestEvent = useRef<MouseEvent | null>(null);

  const processEvent = useCallback((event: MouseEvent) => {
    const el = elementRef?.current;
    let elementX = 0;
    let elementY = 0;
    let isInside = false;

    if (el) {
      const rect = el.getBoundingClientRect();
      elementX = event.clientX - rect.left;
      elementY = event.clientY - rect.top;
      isInside =
        elementX >= 0 &&
        elementY >= 0 &&
        elementX <= rect.width &&
        elementY <= rect.height;
    }

    setPosition({
      x: event.clientX,
      y: event.clientY,
      elementX,
      elementY,
      isInside,
    });
  }, [elementRef]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (throttleMs <= 0) {
      processEvent(event);
      return;
    }

    latestEvent.current = event;

    if (throttleTimer.current) return;

    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;
      if (latestEvent.current) {
        processEvent(latestEvent.current);
      }
    }, throttleMs);
  }, [processEvent, throttleMs]);

  useEffect(() => {
    const target = elementRef?.current || window;

    target.addEventListener('mousemove', handleMouseMove as EventListener);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [elementRef, handleMouseMove]);

  return position;
}
