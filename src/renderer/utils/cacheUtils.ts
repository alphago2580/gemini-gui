interface CacheEntry<V> {
  value: V;
  expiresAt: number | null;
}

export interface Cache<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V, ttl?: number) => void;
  has: (key: K) => boolean;
  delete: (key: K) => boolean;
  clear: () => void;
  size: () => number;
  keys: () => K[];
  values: () => V[];
}

export function createTTLCache<K, V>(defaultTtl?: number): Cache<K, V> {
  const store = new Map<K, CacheEntry<V>>();

  function isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt;
  }

  function get(key: K): V | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (isExpired(entry)) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  function set(key: K, value: V, ttl?: number): void {
    const effectiveTtl = ttl ?? defaultTtl;
    const expiresAt = effectiveTtl !== undefined ? Date.now() + effectiveTtl : null;
    store.set(key, { value, expiresAt });
  }

  function has(key: K): boolean {
    return get(key) !== undefined;
  }

  function del(key: K): boolean {
    return store.delete(key);
  }

  function clear(): void {
    store.clear();
  }

  function size(): number {
    // Clean expired entries first
    for (const [key, entry] of store) {
      if (isExpired(entry)) store.delete(key);
    }
    return store.size;
  }

  function keys(): K[] {
    const result: K[] = [];
    for (const [key, entry] of store) {
      if (!isExpired(entry)) result.push(key);
      else store.delete(key);
    }
    return result;
  }

  function values(): V[] {
    const result: V[] = [];
    for (const [key, entry] of store) {
      if (!isExpired(entry)) result.push(entry.value);
      else store.delete(key);
    }
    return result;
  }

  return { get, set, has, delete: del, clear, size, keys, values };
}

export function createLRUCache<K, V>(maxSize: number): Cache<K, V> {
  const store = new Map<K, V>();

  function get(key: K): V | undefined {
    if (!store.has(key)) return undefined;
    const value = store.get(key)!;
    // Move to end (most recently used)
    store.delete(key);
    store.set(key, value);
    return value;
  }

  function set(key: K, value: V): void {
    if (store.has(key)) {
      store.delete(key);
    } else if (store.size >= maxSize) {
      // Evict least recently used (first entry)
      const firstKey = store.keys().next().value;
      if (firstKey !== undefined) {
        store.delete(firstKey);
      }
    }
    store.set(key, value);
  }

  function has(key: K): boolean {
    return store.has(key);
  }

  function del(key: K): boolean {
    return store.delete(key);
  }

  function clear(): void {
    store.clear();
  }

  function size(): number {
    return store.size;
  }

  function keys(): K[] {
    return [...store.keys()];
  }

  function values(): V[] {
    return [...store.values()];
  }

  return { get, set, has, delete: del, clear, size, keys, values };
}

export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
