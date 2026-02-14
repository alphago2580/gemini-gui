import { useRef, useCallback, useEffect } from 'react';

export interface LongPressOptions {
  /** Duration in ms before long press triggers. Default: 500 */
  threshold?: number;
  /** Called when long press is detected */
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Called on normal click (short press) */
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Called when press starts */
  onStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Called when press ends (regardless of long press) */
  onEnd?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * useLongPress - Detects long press gestures on mouse and touch.
 * Returns event handlers to spread on the target element.
 */
export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const { threshold = 500, onLongPress, onClick, onStart, onEnd } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    longPressedRef.current = false;
    onStart?.(e);
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress(e);
    }, threshold);
  }, [threshold, onLongPress, onStart]);

  const cancel = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressedRef.current) {
      onClick?.(e);
    }
    onEnd?.(e);
    longPressedRef.current = false;
  }, [onClick, onEnd]);

  const leave = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    longPressedRef.current = false;
  }, []);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    onMouseDown: start as (e: React.MouseEvent) => void,
    onMouseUp: cancel as (e: React.MouseEvent) => void,
    onMouseLeave: leave as unknown as (e: React.MouseEvent) => void,
    onTouchStart: start as (e: React.TouchEvent) => void,
    onTouchEnd: cancel as (e: React.TouchEvent) => void,
  };
}
