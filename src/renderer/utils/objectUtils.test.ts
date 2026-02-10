import { describe, it, expect } from 'vitest';
import { pick, omit, deepClone, isEqual, merge, isEmpty, getPath, mapValues } from './objectUtils';

describe('objectUtils', () => {
  describe('pick', () => {
    it('picks specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('ignores non-existent keys', () => {
      const obj = { a: 1 } as Record<string, unknown>;
      expect(pick(obj, ['a', 'missing'] as (keyof typeof obj)[])).toEqual({ a: 1 });
    });

    it('returns empty for empty keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, [])).toEqual({});
    });
  });

  describe('omit', () => {
    it('omits specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('returns copy when omitting nothing', () => {
      const obj = { a: 1 };
      const result = omit(obj, []);
      expect(result).toEqual({ a: 1 });
      expect(result).not.toBe(obj);
    });

    it('handles omitting non-existent keys', () => {
      const obj = { a: 1 } as Record<string, unknown>;
      expect(omit(obj, ['missing'] as (keyof typeof obj)[])).toEqual({ a: 1 });
    });
  });

  describe('deepClone', () => {
    it('clones primitives', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('str')).toBe('str');
      expect(deepClone(null)).toBeNull();
    });

    it('clones flat objects', () => {
      const obj = { a: 1, b: 'two' };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('clones nested objects', () => {
      const obj = { a: { b: { c: 3 } } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('clones arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });
  });

  describe('isEqual', () => {
    it('compares primitives', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual('a', 'a')).toBe(true);
      expect(isEqual('a', 'b')).toBe(false);
    });

    it('compares null and undefined', () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('compares flat objects', () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('compares nested objects', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('compares arrays', () => {
      expect(isEqual([1, 2], [1, 2])).toBe(true);
      expect(isEqual([1, 2], [1, 3])).toBe(false);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('compares different types', () => {
      expect(isEqual(1, '1')).toBe(false);
      expect(isEqual([], {})).toBe(false);
      expect(isEqual(null, 0)).toBe(false);
    });

    it('compares objects with different key counts', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });
  });

  describe('merge', () => {
    it('merges two objects', () => {
      expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    it('later values override earlier', () => {
      expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    });

    it('merges multiple objects', () => {
      expect(merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('returns new object', () => {
      const a = { x: 1 };
      const result = merge(a);
      expect(result).toEqual({ x: 1 });
      expect(result).not.toBe(a);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('returns false for non-empty objects', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('getPath', () => {
    it('gets top-level value', () => {
      expect(getPath({ a: 1 }, 'a')).toBe(1);
    });

    it('gets nested value', () => {
      expect(getPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
    });

    it('returns undefined for missing path', () => {
      expect(getPath({ a: 1 }, 'b')).toBeUndefined();
    });

    it('returns undefined for path through non-object', () => {
      expect(getPath({ a: 1 }, 'a.b')).toBeUndefined();
    });

    it('handles null in path', () => {
      expect(getPath({ a: null } as Record<string, unknown>, 'a.b')).toBeUndefined();
    });
  });

  describe('mapValues', () => {
    it('maps over values', () => {
      const result = mapValues({ a: 1, b: 2 }, v => v * 10);
      expect(result).toEqual({ a: 10, b: 20 });
    });

    it('provides key to callback', () => {
      const result = mapValues({ x: 1 }, (v, k) => `${k}:${v}`);
      expect(result).toEqual({ x: 'x:1' });
    });

    it('handles empty object', () => {
      expect(mapValues({}, v => v)).toEqual({});
    });
  });
});
