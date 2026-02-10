/**
 * Type-safe localStorage utilities with serialization, expiry, and namespace support.
 */

/** Get an item from localStorage with JSON parsing */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/** Set an item in localStorage with JSON serialization */
export function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Remove an item from localStorage */
export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

/** Check if a key exists in localStorage */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/** Get all localStorage keys matching a prefix */
export function getKeysByPrefix(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/** Remove all localStorage keys matching a prefix */
export function removeByPrefix(prefix: string): number {
  const keys = getKeysByPrefix(prefix);
  keys.forEach(key => localStorage.removeItem(key));
  return keys.length;
}

/** Get localStorage usage in bytes (approximate) */
export function getStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      total += key.length + (value?.length ?? 0);
    }
  }
  // Characters are ~2 bytes in UTF-16
  return total * 2;
}

interface ExpiringItem<T> {
  value: T;
  expiresAt: number;
}

/** Set an item with expiry (TTL in milliseconds) */
export function setItemWithExpiry<T>(key: string, value: T, ttl: number): boolean {
  const item: ExpiringItem<T> = {
    value,
    expiresAt: Date.now() + ttl,
  };
  return setItem(key, item);
}

/** Get an item with expiry check — returns defaultValue if expired */
export function getItemWithExpiry<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const item = JSON.parse(raw) as ExpiringItem<T>;
    if (!item.expiresAt || Date.now() > item.expiresAt) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    return item.value;
  } catch {
    return defaultValue;
  }
}

/** Create a namespaced storage helper */
export function createNamespace(prefix: string) {
  return {
    get: <T>(key: string, defaultValue: T): T => getItem(`${prefix}:${key}`, defaultValue),
    set: <T>(key: string, value: T): boolean => setItem(`${prefix}:${key}`, value),
    remove: (key: string): void => removeItem(`${prefix}:${key}`),
    has: (key: string): boolean => hasItem(`${prefix}:${key}`),
    clear: (): number => removeByPrefix(`${prefix}:`),
    keys: (): string[] => getKeysByPrefix(`${prefix}:`).map(k => k.slice(prefix.length + 1)),
  };
}
