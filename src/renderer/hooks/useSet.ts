import { useState, useCallback } from 'react';

export function useSet<T>(initialValues?: Iterable<T>) {
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValues));

  const add = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }, []);

  const remove = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const toggle = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  const has = useCallback((value: T): boolean => {
    return set.has(value);
  }, [set]);

  const reset = useCallback(() => {
    setSet(new Set(initialValues));
  }, [initialValues]);

  return {
    set,
    size: set.size,
    add,
    remove,
    toggle,
    has,
    clear,
    reset,
    values: Array.from(set),
  };
}
