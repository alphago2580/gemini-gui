import { unique, groupBy, chunk, moveItem, range, shuffle, findLast, flatten } from './arrayUtils';

describe('arrayUtils', () => {
  describe('unique', () => {
    it('removes duplicate primitives', () => {
      expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it('removes duplicate strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('uses keyFn for objects', () => {
      const items = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];
      expect(unique(items, i => i.id)).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]);
    });

    it('returns empty array for empty input', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('groups items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      const result = groupBy(items, i => i.type);
      expect(result.get('a')).toEqual([
        { type: 'a', value: 1 },
        { type: 'a', value: 3 },
      ]);
      expect(result.get('b')).toEqual([{ type: 'b', value: 2 }]);
    });

    it('returns empty map for empty array', () => {
      const result = groupBy([], () => 'key');
      expect(result.size).toBe(0);
    });

    it('groups numbers by parity', () => {
      const result = groupBy([1, 2, 3, 4, 5], n => n % 2 === 0 ? 'even' : 'odd');
      expect(result.get('odd')).toEqual([1, 3, 5]);
      expect(result.get('even')).toEqual([2, 4]);
    });
  });

  describe('chunk', () => {
    it('chunks array into specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('returns single chunk when size >= length', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('returns empty array for empty input', () => {
      expect(chunk([], 3)).toEqual([]);
    });

    it('returns empty array for size <= 0', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -1)).toEqual([]);
    });

    it('handles size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });

  describe('moveItem', () => {
    it('moves item forward', () => {
      expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
    });

    it('moves item backward', () => {
      expect(moveItem([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
    });

    it('returns copy when from equals to', () => {
      const arr = [1, 2, 3];
      const result = moveItem(arr, 1, 1);
      expect(result).toEqual([1, 2, 3]);
      expect(result).not.toBe(arr);
    });

    it('returns copy for out-of-bounds indices', () => {
      expect(moveItem([1, 2], -1, 0)).toEqual([1, 2]);
      expect(moveItem([1, 2], 0, 5)).toEqual([1, 2]);
    });
  });

  describe('range', () => {
    it('creates ascending range', () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    });

    it('creates range with step', () => {
      expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);
    });

    it('creates descending range with negative step', () => {
      expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
    });

    it('returns empty for zero step', () => {
      expect(range(0, 5, 0)).toEqual([]);
    });

    it('returns empty when start >= end with positive step', () => {
      expect(range(5, 3)).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('returns array with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffle(arr);
      expect(result).toHaveLength(5);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate original array', () => {
      const arr = [1, 2, 3];
      shuffle(arr);
      expect(arr).toEqual([1, 2, 3]);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(shuffle([42])).toEqual([42]);
    });
  });

  describe('findLast', () => {
    it('finds last matching element', () => {
      expect(findLast([1, 2, 3, 4, 5], n => n % 2 === 0)).toBe(4);
    });

    it('returns undefined when no match', () => {
      expect(findLast([1, 3, 5], n => n % 2 === 0)).toBeUndefined();
    });

    it('returns undefined for empty array', () => {
      expect(findLast([], () => true)).toBeUndefined();
    });

    it('finds last string matching pattern', () => {
      const words = ['apple', 'banana', 'avocado', 'blueberry'];
      expect(findLast(words, w => w.startsWith('a'))).toBe('avocado');
    });
  });

  describe('flatten', () => {
    it('flattens one level of nesting', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles mixed nested and non-nested', () => {
      expect(flatten([1, [2, 3], 4, [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns empty for empty input', () => {
      expect(flatten([])).toEqual([]);
    });

    it('handles already flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });
});
