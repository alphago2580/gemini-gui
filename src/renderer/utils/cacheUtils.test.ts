import { createTTLCache, createLRUCache, memoize } from './cacheUtils';

describe('cacheUtils', () => {
  describe('createTTLCache', () => {
    it('sets and gets values', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const cache = createTTLCache<string, number>();
      expect(cache.get('missing')).toBeUndefined();
    });

    it('has returns true for existing key', () => {
      const cache = createTTLCache<string, string>();
      cache.set('k', 'v');
      expect(cache.has('k')).toBe(true);
    });

    it('has returns false for missing key', () => {
      const cache = createTTLCache<string, string>();
      expect(cache.has('k')).toBe(false);
    });

    it('deletes entries', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
    });

    it('delete returns false for missing key', () => {
      const cache = createTTLCache<string, number>();
      expect(cache.delete('x')).toBe(false);
    });

    it('clears all entries', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('reports correct size', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
    });

    it('returns keys', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.keys().sort()).toEqual(['a', 'b']);
    });

    it('returns values', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.values().sort()).toEqual([1, 2]);
    });

    it('expires entries after TTL', () => {
      vi.useFakeTimers();
      const cache = createTTLCache<string, number>();
      cache.set('a', 1, 100);
      expect(cache.get('a')).toBe(1);
      vi.advanceTimersByTime(101);
      expect(cache.get('a')).toBeUndefined();
      vi.useRealTimers();
    });

    it('uses default TTL when provided', () => {
      vi.useFakeTimers();
      const cache = createTTLCache<string, number>(50);
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
      vi.advanceTimersByTime(51);
      expect(cache.get('a')).toBeUndefined();
      vi.useRealTimers();
    });

    it('per-entry TTL overrides default', () => {
      vi.useFakeTimers();
      const cache = createTTLCache<string, number>(50);
      cache.set('a', 1, 200);
      vi.advanceTimersByTime(100);
      expect(cache.get('a')).toBe(1);
      vi.advanceTimersByTime(101);
      expect(cache.get('a')).toBeUndefined();
      vi.useRealTimers();
    });

    it('no TTL means no expiration', () => {
      vi.useFakeTimers();
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      vi.advanceTimersByTime(999999);
      expect(cache.get('a')).toBe(1);
      vi.useRealTimers();
    });

    it('expired entries excluded from size/keys/values', () => {
      vi.useFakeTimers();
      const cache = createTTLCache<string, number>();
      cache.set('a', 1, 50);
      cache.set('b', 2);
      vi.advanceTimersByTime(51);
      expect(cache.size()).toBe(1);
      expect(cache.keys()).toEqual(['b']);
      expect(cache.values()).toEqual([2]);
      vi.useRealTimers();
    });

    it('overwrites existing key', () => {
      const cache = createTTLCache<string, number>();
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.get('a')).toBe(2);
      expect(cache.size()).toBe(1);
    });
  });

  describe('createLRUCache', () => {
    it('sets and gets values', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const cache = createLRUCache<string, number>(3);
      expect(cache.get('missing')).toBeUndefined();
    });

    it('evicts least recently used when full', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // evicts 'a'
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('d')).toBe(4);
    });

    it('get marks entry as recently used', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.get('a'); // marks 'a' as recent
      cache.set('d', 4); // evicts 'b' instead of 'a'
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
    });

    it('respects max size', () => {
      const cache = createLRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.size()).toBe(2);
    });

    it('overwrites without increasing size', () => {
      const cache = createLRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('a', 10);
      expect(cache.size()).toBe(2);
      expect(cache.get('a')).toBe(10);
    });

    it('has returns correct boolean', () => {
      const cache = createLRUCache<string, number>(2);
      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('deletes entries', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.delete('a');
      expect(cache.has('a')).toBe(false);
      expect(cache.size()).toBe(0);
    });

    it('clears all entries', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('returns keys in order', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.keys()).toEqual(['a', 'b', 'c']);
    });

    it('returns values', () => {
      const cache = createLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.values()).toEqual([1, 2]);
    });

    it('max size of 1', () => {
      const cache = createLRUCache<string, string>(1);
      cache.set('a', 'first');
      cache.set('b', 'second');
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe('second');
      expect(cache.size()).toBe(1);
    });
  });

  describe('memoize', () => {
    it('caches function results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('different args produce different results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(3)).toBe(6);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('works with multiple arguments', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('uses custom key function', () => {
      const fn = vi.fn((obj: { id: number }) => obj.id * 2);
      const memoized = memoize(fn, (obj) => String(obj.id));
      expect(memoized({ id: 1 })).toBe(2);
      expect(memoized({ id: 1 })).toBe(2); // Same id, cached
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('works with string arguments', () => {
      const fn = vi.fn((s: string) => s.toUpperCase());
      const memoized = memoize(fn);
      expect(memoized('hello')).toBe('HELLO');
      expect(memoized('hello')).toBe('HELLO');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('caches falsy return values', () => {
      const fn = vi.fn(() => 0);
      const memoized = memoize(fn);
      expect(memoized()).toBe(0);
      expect(memoized()).toBe(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
