import { describe, it, expect } from 'vitest';
import { deepEqual } from './deepEqual';

describe('deepEqual', () => {
  describe('primitives', () => {
    it('compares equal numbers', () => {
      expect(deepEqual(1, 1)).toBe(true);
    });

    it('compares unequal numbers', () => {
      expect(deepEqual(1, 2)).toBe(false);
    });

    it('compares equal strings', () => {
      expect(deepEqual('hello', 'hello')).toBe(true);
    });

    it('compares unequal strings', () => {
      expect(deepEqual('hello', 'world')).toBe(false);
    });

    it('compares booleans', () => {
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('compares null values', () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    it('compares undefined values', () => {
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('differentiates null and undefined', () => {
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(undefined, null)).toBe(false);
    });

    it('handles NaN correctly', () => {
      expect(deepEqual(NaN, NaN)).toBe(true);
    });

    it('differentiates NaN from numbers', () => {
      expect(deepEqual(NaN, 0)).toBe(false);
      expect(deepEqual(NaN, 1)).toBe(false);
    });

    it('differentiates +0 and -0', () => {
      expect(deepEqual(0, -0)).toBe(false);
      expect(deepEqual(-0, 0)).toBe(false);
    });

    it('compares +0 to +0', () => {
      expect(deepEqual(0, 0)).toBe(true);
    });

    it('compares -0 to -0', () => {
      expect(deepEqual(-0, -0)).toBe(true);
    });

    it('compares Infinity', () => {
      expect(deepEqual(Infinity, Infinity)).toBe(true);
      expect(deepEqual(-Infinity, -Infinity)).toBe(true);
      expect(deepEqual(Infinity, -Infinity)).toBe(false);
    });

    it('compares empty string', () => {
      expect(deepEqual('', '')).toBe(true);
      expect(deepEqual('', 'a')).toBe(false);
    });

    it('compares bigint values', () => {
      expect(deepEqual(BigInt(42), BigInt(42))).toBe(true);
      expect(deepEqual(BigInt(42), BigInt(43))).toBe(false);
    });

    it('differentiates types', () => {
      expect(deepEqual(1, '1')).toBe(false);
      expect(deepEqual(0, false)).toBe(false);
      expect(deepEqual('', false)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
      expect(deepEqual(undefined, 0)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('compares empty arrays', () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it('compares equal arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('compares unequal arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('compares arrays of different lengths', () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('compares nested arrays', () => {
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false);
    });

    it('compares arrays with mixed types', () => {
      expect(deepEqual([1, 'two', true, null], [1, 'two', true, null])).toBe(true);
      expect(deepEqual([1, 'two', true, null], [1, 'two', false, null])).toBe(false);
    });

    it('differentiates array from non-array', () => {
      expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });

    it('compares arrays with undefined elements', () => {
      expect(deepEqual([undefined, undefined], [undefined, undefined])).toBe(true);
    });

    it('compares arrays with objects', () => {
      expect(deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true);
      expect(deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }])).toBe(false);
    });
  });

  describe('plain objects', () => {
    it('compares empty objects', () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it('compares equal objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('compares objects regardless of key order', () => {
      expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it('compares unequal objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('compares objects with different keys', () => {
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('compares objects with different number of keys', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('compares nested objects', () => {
      expect(deepEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 1 } } }
      )).toBe(true);
      expect(deepEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } }
      )).toBe(false);
    });

    it('compares objects with null values', () => {
      expect(deepEqual({ a: null }, { a: null })).toBe(true);
      expect(deepEqual({ a: null }, { a: undefined })).toBe(false);
    });

    it('compares objects with array values', () => {
      expect(deepEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
      expect(deepEqual({ a: [1, 2] }, { a: [1, 3] })).toBe(false);
    });

    it('differentiates object from null', () => {
      expect(deepEqual({}, null)).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('Date', () => {
    it('compares equal dates', () => {
      const d1 = new Date('2024-01-01');
      const d2 = new Date('2024-01-01');
      expect(deepEqual(d1, d2)).toBe(true);
    });

    it('compares unequal dates', () => {
      const d1 = new Date('2024-01-01');
      const d2 = new Date('2024-06-15');
      expect(deepEqual(d1, d2)).toBe(false);
    });

    it('compares invalid dates', () => {
      const d1 = new Date('invalid');
      const d2 = new Date('invalid');
      // Both produce NaN getTime, but NaN !== NaN so this depends on implementation
      // Our implementation uses getTime() which returns NaN for invalid dates
      // NaN === NaN is false, so invalid dates won't be equal
      expect(deepEqual(d1, d2)).toBe(false);
    });

    it('differentiates Date from plain object', () => {
      const d = new Date('2024-01-01');
      expect(deepEqual(d, {})).toBe(false);
    });

    it('compares dates inside objects', () => {
      const obj1 = { created: new Date('2024-01-01') };
      const obj2 = { created: new Date('2024-01-01') };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('RegExp', () => {
    it('compares equal regexps', () => {
      expect(deepEqual(/abc/, /abc/)).toBe(true);
    });

    it('compares regexps with same pattern but different flags', () => {
      expect(deepEqual(/abc/i, /abc/g)).toBe(false);
    });

    it('compares regexps with different patterns', () => {
      expect(deepEqual(/abc/, /def/)).toBe(false);
    });

    it('compares regexps with same flags', () => {
      expect(deepEqual(/test/gi, /test/gi)).toBe(true);
    });

    it('differentiates RegExp from plain object', () => {
      expect(deepEqual(/abc/, {})).toBe(false);
    });

    it('compares regexps inside objects', () => {
      expect(deepEqual(
        { pattern: /hello/i },
        { pattern: /hello/i }
      )).toBe(true);
    });
  });

  describe('Map', () => {
    it('compares empty maps', () => {
      expect(deepEqual(new Map(), new Map())).toBe(true);
    });

    it('compares equal maps', () => {
      const m1 = new Map([['a', 1], ['b', 2]]);
      const m2 = new Map([['a', 1], ['b', 2]]);
      expect(deepEqual(m1, m2)).toBe(true);
    });

    it('compares maps with different values', () => {
      const m1 = new Map([['a', 1]]);
      const m2 = new Map([['a', 2]]);
      expect(deepEqual(m1, m2)).toBe(false);
    });

    it('compares maps with different keys', () => {
      const m1 = new Map([['a', 1]]);
      const m2 = new Map([['b', 1]]);
      expect(deepEqual(m1, m2)).toBe(false);
    });

    it('compares maps of different sizes', () => {
      const m1 = new Map([['a', 1]]);
      const m2 = new Map([['a', 1], ['b', 2]]);
      expect(deepEqual(m1, m2)).toBe(false);
    });

    it('compares maps with object values deeply', () => {
      const m1 = new Map([['key', { nested: true }]]);
      const m2 = new Map([['key', { nested: true }]]);
      expect(deepEqual(m1, m2)).toBe(true);
    });

    it('differentiates Map from plain object', () => {
      expect(deepEqual(new Map(), {})).toBe(false);
    });
  });

  describe('Set', () => {
    it('compares empty sets', () => {
      expect(deepEqual(new Set(), new Set())).toBe(true);
    });

    it('compares equal sets', () => {
      expect(deepEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true);
    });

    it('compares sets with different values', () => {
      expect(deepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    });

    it('compares sets of different sizes', () => {
      expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
    });

    it('compares sets with same values in different order', () => {
      expect(deepEqual(new Set([3, 1, 2]), new Set([1, 2, 3]))).toBe(true);
    });

    it('compares string sets', () => {
      expect(deepEqual(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(true);
      expect(deepEqual(new Set(['a', 'b']), new Set(['a', 'c']))).toBe(false);
    });

    it('differentiates Set from array', () => {
      expect(deepEqual(new Set([1, 2]), [1, 2])).toBe(false);
    });
  });

  describe('circular references', () => {
    it('handles circular object references', () => {
      const a: Record<string, unknown> = { x: 1 };
      a.self = a;
      const b: Record<string, unknown> = { x: 1 };
      b.self = b;
      expect(deepEqual(a, b)).toBe(true);
    });

    it('handles circular array references', () => {
      const a: unknown[] = [1, 2];
      a.push(a);
      const b: unknown[] = [1, 2];
      b.push(b);
      expect(deepEqual(a, b)).toBe(true);
    });

    it('handles mutual circular references', () => {
      const a1: Record<string, unknown> = {};
      const a2: Record<string, unknown> = {};
      a1.ref = a2;
      a2.ref = a1;

      const b1: Record<string, unknown> = {};
      const b2: Record<string, unknown> = {};
      b1.ref = b2;
      b2.ref = b1;

      expect(deepEqual(a1, b1)).toBe(true);
    });
  });

  describe('same reference', () => {
    it('returns true for same object reference', () => {
      const obj = { a: 1 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it('returns true for same array reference', () => {
      const arr = [1, 2, 3];
      expect(deepEqual(arr, arr)).toBe(true);
    });
  });

  describe('complex nested structures', () => {
    it('compares deeply nested mixed structure', () => {
      const a = {
        users: [
          { name: 'Alice', tags: new Set(['admin', 'user']), meta: { joined: new Date('2024-01-01') } },
          { name: 'Bob', tags: new Set(['user']), meta: { joined: new Date('2024-06-01') } },
        ],
        config: new Map([['theme', 'dark'], ['lang', 'ko']]),
      };
      const b = {
        users: [
          { name: 'Alice', tags: new Set(['admin', 'user']), meta: { joined: new Date('2024-01-01') } },
          { name: 'Bob', tags: new Set(['user']), meta: { joined: new Date('2024-06-01') } },
        ],
        config: new Map([['theme', 'dark'], ['lang', 'ko']]),
      };
      expect(deepEqual(a, b)).toBe(true);
    });

    it('detects difference in deeply nested structure', () => {
      const a = {
        level1: { level2: { level3: { level4: { value: 'original' } } } },
      };
      const b = {
        level1: { level2: { level3: { level4: { value: 'changed' } } } },
      };
      expect(deepEqual(a, b)).toBe(false);
    });

    it('compares objects with array of arrays', () => {
      expect(deepEqual(
        { matrix: [[1, 2], [3, 4]] },
        { matrix: [[1, 2], [3, 4]] }
      )).toBe(true);
    });

    it('compares real-world settings object', () => {
      const settings1 = {
        general: { language: 'ko', fontSize: 14 },
        appearance: { theme: 'dark', accentColor: '#3b82f6' },
        shortcuts: { send: 'Enter', newChat: 'Ctrl+N' },
        advanced: { debug: false, experimental: [] },
      };
      const settings2 = {
        general: { language: 'ko', fontSize: 14 },
        appearance: { theme: 'dark', accentColor: '#3b82f6' },
        shortcuts: { send: 'Enter', newChat: 'Ctrl+N' },
        advanced: { debug: false, experimental: [] },
      };
      expect(deepEqual(settings1, settings2)).toBe(true);
    });

    it('detects difference in settings object', () => {
      const settings1 = {
        general: { language: 'ko', fontSize: 14 },
      };
      const settings2 = {
        general: { language: 'en', fontSize: 14 },
      };
      expect(deepEqual(settings1, settings2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('compares symbols as identity', () => {
      const sym = Symbol('test');
      expect(deepEqual(sym, sym)).toBe(true);
    });

    it('differentiates different symbols', () => {
      expect(deepEqual(Symbol('a'), Symbol('a'))).toBe(false);
    });

    it('compares functions by reference', () => {
      const fn = () => {};
      expect(deepEqual(fn, fn)).toBe(true);
    });

    it('differentiates different functions', () => {
      expect(deepEqual(() => {}, () => {})).toBe(false);
    });

    it('handles objects with numeric string keys', () => {
      expect(deepEqual({ '0': 'a', '1': 'b' }, { '0': 'a', '1': 'b' })).toBe(true);
    });

    it('handles object with inherited properties (ignores prototype)', () => {
      const proto = { inherited: true };
      const a = Object.create(proto);
      a.own = 1;
      const b = { own: 1 };
      expect(deepEqual(a, b)).toBe(true);
    });
  });
});
