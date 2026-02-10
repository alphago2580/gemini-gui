import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  value: T;
  set: (newValue: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newValue: T) => void;
  historySize: number;
}

const DEFAULT_MAX_HISTORY = 50;

export function useUndoRedo<T>(initialValue: T, maxHistory: number = DEFAULT_MAX_HISTORY): UndoRedoState<T> {
  const [value, setValue] = useState<T>(initialValue);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const set = useCallback((newValue: T) => {
    setValue(prev => {
      pastRef.current = [...pastRef.current, prev].slice(-maxHistory);
      futureRef.current = [];
      return newValue;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    setValue(prev => {
      const past = pastRef.current;
      const previous = past[past.length - 1];
      pastRef.current = past.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    setValue(prev => {
      const future = futureRef.current;
      const next = future[0];
      futureRef.current = future.slice(1);
      pastRef.current = [...pastRef.current, prev];
      return next;
    });
  }, []);

  const reset = useCallback((newValue: T) => {
    setValue(newValue);
    pastRef.current = [];
    futureRef.current = [];
  }, []);

  return {
    value,
    set,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    reset,
    historySize: pastRef.current.length,
  };
}
