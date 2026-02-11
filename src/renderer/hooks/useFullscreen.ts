import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseFullscreenOptions {
  /** Target element ref — defaults to document.documentElement */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Called when entering fullscreen */
  onEnter?: () => void;
  /** Called when exiting fullscreen */
  onExit?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseFullscreenResult {
  /** Whether currently in fullscreen */
  isFullscreen: boolean;
  /** Enter fullscreen */
  enter: () => Promise<void>;
  /** Exit fullscreen */
  exit: () => Promise<void>;
  /** Toggle fullscreen */
  toggle: () => Promise<void>;
  /** Whether the browser supports fullscreen */
  isSupported: boolean;
}

function getFullscreenElement(): Element | null {
  return document.fullscreenElement ?? null;
}

export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenResult {
  const { targetRef, onEnter, onExit, onError } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const isSupported =
    typeof document !== 'undefined' &&
    typeof document.documentElement?.requestFullscreen === 'function';

  const enter = useCallback(async () => {
    if (!isSupported) return;
    try {
      const element = targetRef?.current ?? document.documentElement;
      await element.requestFullscreen();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onErrorRef.current?.(error);
    }
  }, [isSupported, targetRef]);

  const exit = useCallback(async () => {
    if (!isSupported) return;
    if (!getFullscreenElement()) return;
    try {
      await document.exitFullscreen();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onErrorRef.current?.(error);
    }
  }, [isSupported]);

  const toggle = useCallback(async () => {
    if (getFullscreenElement()) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  useEffect(() => {
    const handleChange = () => {
      const full = !!getFullscreenElement();
      setIsFullscreen(full);
      if (full) {
        onEnterRef.current?.();
      } else {
        onExitRef.current?.();
      }
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  return { isFullscreen, enter, exit, toggle, isSupported };
}
