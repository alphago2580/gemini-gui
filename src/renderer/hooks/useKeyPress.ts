import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseKeyPressOptions {
  target?: EventTarget | null;
  event?: 'keydown' | 'keyup' | 'keypress';
  enabled?: boolean;
}

export function useKeyPress(
  targetKey: string,
  options: UseKeyPressOptions = {}
): boolean {
  const { target, event = 'keydown', enabled = true } = options;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsPressed(false);
      return;
    }

    const element = target ?? window;

    const handleKeyDown = (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === targetKey) {
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === targetKey) {
        setIsPressed(false);
      }
    };

    if (event === 'keydown' || event === 'keypress') {
      element.addEventListener(event, handleKeyDown);
      element.addEventListener('keyup', handleKeyUp);
      return () => {
        element.removeEventListener(event, handleKeyDown);
        element.removeEventListener('keyup', handleKeyUp);
      };
    }

    // For 'keyup' event mode, only track keyup
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('keydown', handleKeyDown);
    return () => {
      element.removeEventListener('keyup', handleKeyUp);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, target, event, enabled]);

  return isPressed;
}

export interface UseKeyPressCallbackOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyPressCallback(
  targetKey: string,
  callback: () => void,
  options: UseKeyPressCallbackOptions = {}
): void {
  const { ctrl = false, shift = false, alt = false, meta = false, preventDefault = false, enabled = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handleKeyDown = useCallback(
    (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (
        keyEvent.key === targetKey &&
        keyEvent.ctrlKey === ctrl &&
        keyEvent.shiftKey === shift &&
        keyEvent.altKey === alt &&
        keyEvent.metaKey === meta
      ) {
        if (preventDefault) {
          keyEvent.preventDefault();
        }
        callbackRef.current();
      }
    },
    [targetKey, ctrl, shift, alt, meta, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
