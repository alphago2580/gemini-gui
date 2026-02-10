import { useState, useCallback } from 'react';

export function useMap<K, V>(initialEntries?: Iterable<[K, V]>) {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initialEntries));

  const set = useCallback((key: K, value: V) => {
    setMap(prev => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const remove = useCallback((key: K) => {
    setMap(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setMap(new Map());
  }, []);

  const has = useCallback((key: K): boolean => {
    return map.has(key);
  }, [map]);

  const get = useCallback((key: K): V | undefined => {
    return map.get(key);
  }, [map]);

  const reset = useCallback(() => {
    setMap(new Map(initialEntries));
  }, [initialEntries]);

  return {
    map,
    size: map.size,
    set,
    get,
    has,
    remove,
    clear,
    reset,
    entries: Array.from(map.entries()),
    keys: Array.from(map.keys()),
    values: Array.from(map.values()),
  };
}
