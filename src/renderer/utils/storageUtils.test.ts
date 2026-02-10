import {
  getItem,
  setItem,
  removeItem,
  hasItem,
  getKeysByPrefix,
  removeByPrefix,
  getStorageSize,
  setItemWithExpiry,
  getItemWithExpiry,
  createNamespace,
} from './storageUtils';

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getItem', () => {
    it('returns parsed value for existing key', () => {
      localStorage.setItem('test', JSON.stringify({ a: 1 }));
      expect(getItem('test', null)).toEqual({ a: 1 });
    });

    it('returns default for missing key', () => {
      expect(getItem('missing', 'default')).toBe('default');
    });

    it('returns default for invalid JSON', () => {
      localStorage.setItem('bad', 'not json');
      expect(getItem('bad', 42)).toBe(42);
    });

    it('handles primitive values', () => {
      localStorage.setItem('num', '123');
      expect(getItem('num', 0)).toBe(123);

      localStorage.setItem('bool', 'true');
      expect(getItem('bool', false)).toBe(true);

      localStorage.setItem('str', '"hello"');
      expect(getItem('str', '')).toBe('hello');
    });

    it('handles arrays', () => {
      localStorage.setItem('arr', '[1,2,3]');
      expect(getItem('arr', [])).toEqual([1, 2, 3]);
    });
  });

  describe('setItem', () => {
    it('stores serialized value and returns true', () => {
      expect(setItem('key', { x: 1 })).toBe(true);
      expect(localStorage.getItem('key')).toBe('{"x":1}');
    });

    it('stores primitives', () => {
      setItem('num', 42);
      expect(localStorage.getItem('num')).toBe('42');
    });

    it('returns false when storage fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      expect(setItem('key', 'val')).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('removeItem', () => {
    it('removes item from storage', () => {
      localStorage.setItem('key', 'val');
      removeItem('key');
      expect(localStorage.getItem('key')).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('returns true for existing key', () => {
      localStorage.setItem('exists', 'val');
      expect(hasItem('exists')).toBe(true);
    });

    it('returns false for missing key', () => {
      expect(hasItem('missing')).toBe(false);
    });
  });

  describe('getKeysByPrefix', () => {
    it('returns keys matching prefix', () => {
      localStorage.setItem('app:one', '1');
      localStorage.setItem('app:two', '2');
      localStorage.setItem('other:three', '3');
      const keys = getKeysByPrefix('app:');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('app:one');
      expect(keys).toContain('app:two');
    });

    it('returns empty array when no matches', () => {
      localStorage.setItem('foo', '1');
      expect(getKeysByPrefix('bar:')).toEqual([]);
    });
  });

  describe('removeByPrefix', () => {
    it('removes all keys with prefix and returns count', () => {
      localStorage.setItem('ns:a', '1');
      localStorage.setItem('ns:b', '2');
      localStorage.setItem('other', '3');
      expect(removeByPrefix('ns:')).toBe(2);
      expect(localStorage.getItem('ns:a')).toBeNull();
      expect(localStorage.getItem('ns:b')).toBeNull();
      expect(localStorage.getItem('other')).toBe('3');
    });

    it('returns 0 when no matches', () => {
      expect(removeByPrefix('none:')).toBe(0);
    });
  });

  describe('getStorageSize', () => {
    it('returns approximate size in bytes', () => {
      localStorage.setItem('k', 'v');
      const size = getStorageSize();
      // 'k' (1 char) + 'v' (1 char) = 2 chars * 2 bytes = 4 bytes
      expect(size).toBe(4);
    });

    it('returns 0 for empty storage', () => {
      expect(getStorageSize()).toBe(0);
    });
  });

  describe('setItemWithExpiry / getItemWithExpiry', () => {
    it('stores and retrieves value before expiry', () => {
      vi.useFakeTimers();
      setItemWithExpiry('temp', 'value', 5000);
      expect(getItemWithExpiry('temp', 'default')).toBe('value');
      vi.useRealTimers();
    });

    it('returns default after expiry', () => {
      vi.useFakeTimers();
      setItemWithExpiry('temp', 'value', 1000);
      vi.advanceTimersByTime(2000);
      expect(getItemWithExpiry('temp', 'expired')).toBe('expired');
      // Item should be cleaned up
      expect(localStorage.getItem('temp')).toBeNull();
      vi.useRealTimers();
    });

    it('returns default for missing key', () => {
      expect(getItemWithExpiry('missing', 'default')).toBe('default');
    });

    it('returns default for invalid data', () => {
      localStorage.setItem('bad', 'not json');
      expect(getItemWithExpiry('bad', 'fallback')).toBe('fallback');
    });
  });

  describe('createNamespace', () => {
    it('prefixes keys with namespace', () => {
      const ns = createNamespace('myapp');
      ns.set('theme', 'dark');
      expect(localStorage.getItem('myapp:theme')).toBe('"dark"');
    });

    it('gets namespaced values', () => {
      const ns = createNamespace('myapp');
      ns.set('count', 42);
      expect(ns.get('count', 0)).toBe(42);
    });

    it('checks existence with has', () => {
      const ns = createNamespace('myapp');
      expect(ns.has('key')).toBe(false);
      ns.set('key', true);
      expect(ns.has('key')).toBe(true);
    });

    it('removes namespaced items', () => {
      const ns = createNamespace('myapp');
      ns.set('key', 'val');
      ns.remove('key');
      expect(ns.has('key')).toBe(false);
    });

    it('clears all namespaced items', () => {
      const ns = createNamespace('myapp');
      ns.set('a', 1);
      ns.set('b', 2);
      localStorage.setItem('other', '3');
      expect(ns.clear()).toBe(2);
      expect(ns.has('a')).toBe(false);
      expect(localStorage.getItem('other')).toBe('3');
    });

    it('lists keys without prefix', () => {
      const ns = createNamespace('myapp');
      ns.set('one', 1);
      ns.set('two', 2);
      const keys = ns.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('one');
      expect(keys).toContain('two');
    });
  });
});
