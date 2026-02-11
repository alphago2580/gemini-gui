import { useState, useCallback, useRef } from 'react';

export interface StateHistoryEntry<T> {
  value: T;
  timestamp: number;
}

export interface StateWithHistoryResult<T> {
  value: T;
  setValue: (newValue: T) => void;
  history: StateHistoryEntry<T>[];
  historySize: number;
  clearHistory: () => void;
  goTo: (index: number) => void;
}

export function useStateWithHistory<T>(
  initialValue: T,
  maxHistory: number = 100
): StateWithHistoryResult<T> {
  const [value, setValueInternal] = useState<T>(initialValue);
  const historyRef = useRef<StateHistoryEntry<T>[]>([
    { value: initialValue, timestamp: Date.now() },
  ]);
  const [, forceUpdate] = useState(0);

  const setValue = useCallback((newValue: T) => {
    setValueInternal(newValue);
    historyRef.current = [
      ...historyRef.current.slice(-(maxHistory - 1)),
      { value: newValue, timestamp: Date.now() },
    ];
    forceUpdate(n => n + 1);
  }, [maxHistory]);

  const clearHistory = useCallback(() => {
    historyRef.current = [
      { value: historyRef.current[historyRef.current.length - 1].value, timestamp: Date.now() },
    ];
    forceUpdate(n => n + 1);
  }, []);

  const goTo = useCallback((index: number) => {
    const history = historyRef.current;
    if (index < 0 || index >= history.length) return;
    setValueInternal(history[index].value);
  }, []);

  return {
    value,
    setValue,
    history: historyRef.current,
    historySize: historyRef.current.length,
    clearHistory,
    goTo,
  };
}
