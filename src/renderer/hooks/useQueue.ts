import { useState, useCallback, useMemo } from 'react';

/**
 * FIFO queue state management hook.
 * Provides enqueue, dequeue, peek, clear, and size operations.
 */
export function useQueue<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const enqueue = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const dequeue = useCallback((): T | undefined => {
    let removed: T | undefined;
    setItems(prev => {
      if (prev.length === 0) return prev;
      removed = prev[0];
      return prev.slice(1);
    });
    return removed;
  }, []);

  const peek = useMemo(() => {
    return items.length > 0 ? items[0] : undefined;
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const size = items.length;
  const isEmpty = items.length === 0;

  const contains = useCallback((predicate: (item: T) => boolean): boolean => {
    return items.some(predicate);
  }, [items]);

  const toArray = useCallback((): T[] => {
    return [...items];
  }, [items]);

  return {
    items,
    enqueue,
    dequeue,
    peek,
    clear,
    size,
    isEmpty,
    contains,
    toArray,
  };
}
