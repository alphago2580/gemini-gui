import { useState, useCallback, useEffect, useRef } from 'react';

export interface PointerLockMovement {
  movementX: number;
  movementY: number;
}

export interface UsePointerLockReturn {
  isLocked: boolean;
  isSupported: boolean;
  error: Error | null;
  movement: PointerLockMovement;
  lock: (element?: HTMLElement | null) => void;
  unlock: () => void;
}

export function usePointerLock(): UsePointerLockReturn {
  const isSupported = typeof document !== 'undefined' && 'pointerLockElement' in document;

  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [movement, setMovement] = useState<PointerLockMovement>({ movementX: 0, movementY: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const handleChange = useCallback(() => {
    const locked = document.pointerLockElement !== null;
    setIsLocked(locked);
    if (!locked) {
      setMovement({ movementX: 0, movementY: 0 });
    }
  }, []);

  const handleError = useCallback(() => {
    setError(new Error('Pointer lock request failed'));
    setIsLocked(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (document.pointerLockElement) {
      setMovement({ movementX: e.movementX, movementY: e.movementY });
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    document.addEventListener('pointerlockchange', handleChange);
    document.addEventListener('pointerlockerror', handleError);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handleChange);
      document.removeEventListener('pointerlockerror', handleError);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSupported, handleChange, handleError, handleMouseMove]);

  const lock = useCallback((element?: HTMLElement | null) => {
    if (!isSupported) {
      setError(new Error('Pointer Lock API is not supported'));
      return;
    }

    const target = element ?? elementRef.current ?? document.body;
    elementRef.current = target;
    setError(null);

    try {
      target.requestPointerLock();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [isSupported]);

  const unlock = useCallback(() => {
    if (isSupported && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isSupported]);

  return { isLocked, isSupported, error, movement, lock, unlock };
}
