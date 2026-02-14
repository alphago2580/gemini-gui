import {
  range,
  chunk,
  zip,
  take,
  skip,
  filter,
  map,
  flatten,
  enumerate,
  takeWhile,
  skipWhile,
  unique,
  reduce,
  toArray,
  cycle,
} from './iteratorUtils';

describe('iteratorUtils', () => {
  describe('range', () => {
    it('generates range from 0 to n', () => {
      expect([...range(5)]).toEqual([0, 1, 2, 3, 4]);
    });

    it('generates range with start and end', () => {
      expect([...range(2, 6)]).toEqual([2, 3, 4, 5]);
    });

    it('generates range with custom step', () => {
      expect([...range(0, 10, 3)]).toEqual([0, 3, 6, 9]);
    });

    it('generates descending range', () => {
      expect([...range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1]);
    });

    it('returns empty for zero range', () => {
      expect([...range(0)]).toEqual([]);
    });

    it('returns empty for invalid step', () => {
      expect([...range(0, 5, 0)]).toEqual([]);
    });
  });

  describe('chunk', () => {
    it('chunks array into equal parts', () => {
      expect([...chunk([1, 2, 3, 4], 2)]).toEqual([[1, 2], [3, 4]]);
    });

    it('handles uneven last chunk', () => {
      expect([...chunk([1, 2, 3, 4, 5], 2)]).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('handles single item chunks', () => {
      expect([...chunk([1, 2, 3], 1)]).toEqual([[1], [2], [3]]);
    });

    it('handles empty iterable', () => {
      expect([...chunk([], 3)]).toEqual([]);
    });

    it('handles chunk size larger than input', () => {
      expect([...chunk([1, 2], 5)]).toEqual([[1, 2]]);
    });
  });

  describe('zip', () => {
    it('zips two arrays', () => {
      expect([...zip<number | string>([1, 2, 3], ['a', 'b', 'c'])]).toEqual([
        [1, 'a'], [2, 'b'], [3, 'c'],
      ]);
    });

    it('stops at shortest iterable', () => {
      expect([...zip<number | string>([1, 2], ['a', 'b', 'c'])]).toEqual([
        [1, 'a'], [2, 'b'],
      ]);
    });

    it('zips three arrays', () => {
      expect([...zip<number>([1], [2], [3])]).toEqual([[1, 2, 3]]);
    });

    it('handles empty iterables', () => {
      expect([...zip<number>([], [1, 2])]).toEqual([]);
    });
  });

  describe('take', () => {
    it('takes first n items', () => {
      expect([...take([1, 2, 3, 4, 5], 3)]).toEqual([1, 2, 3]);
    });

    it('takes all if n > length', () => {
      expect([...take([1, 2], 5)]).toEqual([1, 2]);
    });

    it('takes 0 items', () => {
      expect([...take([1, 2, 3], 0)]).toEqual([]);
    });

    it('works with generators', () => {
      expect([...take(range(100), 3)]).toEqual([0, 1, 2]);
    });
  });

  describe('skip', () => {
    it('skips first n items', () => {
      expect([...skip([1, 2, 3, 4, 5], 2)]).toEqual([3, 4, 5]);
    });

    it('skips all items', () => {
      expect([...skip([1, 2], 5)]).toEqual([]);
    });

    it('skips 0 items', () => {
      expect([...skip([1, 2, 3], 0)]).toEqual([1, 2, 3]);
    });
  });

  describe('filter', () => {
    it('filters by predicate', () => {
      expect([...filter([1, 2, 3, 4, 5], (x) => x % 2 === 0)]).toEqual([2, 4]);
    });

    it('provides index to predicate', () => {
      const indices: number[] = [];
      [...filter([10, 20, 30], (_, i) => { indices.push(i); return true; })];
      expect(indices).toEqual([0, 1, 2]);
    });

    it('returns empty when nothing matches', () => {
      expect([...filter([1, 2, 3], () => false)]).toEqual([]);
    });
  });

  describe('map', () => {
    it('transforms items', () => {
      expect([...map([1, 2, 3], (x) => x * 2)]).toEqual([2, 4, 6]);
    });

    it('provides index to transform', () => {
      expect([...map(['a', 'b'], (item, i) => `${i}:${item}`)]).toEqual(['0:a', '1:b']);
    });

    it('handles empty iterable', () => {
      expect([...map([], (x: number) => x)]).toEqual([]);
    });
  });

  describe('flatten', () => {
    it('flattens one level', () => {
      expect([...flatten([[1, 2], [3, 4], [5]])]).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles empty arrays', () => {
      expect([...flatten([[], [1], []])]).toEqual([1]);
    });

    it('handles empty input', () => {
      expect([...flatten([])]).toEqual([]);
    });
  });

  describe('enumerate', () => {
    it('enumerates from 0', () => {
      expect([...enumerate(['a', 'b', 'c'])]).toEqual([
        [0, 'a'], [1, 'b'], [2, 'c'],
      ]);
    });

    it('enumerates from custom start', () => {
      expect([...enumerate(['x', 'y'], 5)]).toEqual([
        [5, 'x'], [6, 'y'],
      ]);
    });

    it('handles empty iterable', () => {
      expect([...enumerate([])]).toEqual([]);
    });
  });

  describe('takeWhile', () => {
    it('takes while condition is true', () => {
      expect([...takeWhile([1, 2, 3, 4, 1], (x) => x < 3)]).toEqual([1, 2]);
    });

    it('takes all if always true', () => {
      expect([...takeWhile([1, 2], () => true)]).toEqual([1, 2]);
    });

    it('takes none if first fails', () => {
      expect([...takeWhile([5, 1, 2], (x) => x < 3)]).toEqual([]);
    });
  });

  describe('skipWhile', () => {
    it('skips while condition is true', () => {
      expect([...skipWhile([1, 2, 3, 4, 1], (x) => x < 3)]).toEqual([3, 4, 1]);
    });

    it('skips all if always true', () => {
      expect([...skipWhile([1, 2], () => true)]).toEqual([]);
    });

    it('skips none if first fails', () => {
      expect([...skipWhile([5, 1, 2], (x) => x < 3)]).toEqual([5, 1, 2]);
    });
  });

  describe('unique', () => {
    it('removes duplicates', () => {
      expect([...unique([1, 2, 2, 3, 1, 3])]).toEqual([1, 2, 3]);
    });

    it('uses key function', () => {
      const items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 1, name: 'c' }];
      expect([...unique(items, (x) => x.id)]).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]);
    });

    it('handles empty iterable', () => {
      expect([...unique([])]).toEqual([]);
    });

    it('preserves order', () => {
      expect([...unique([3, 1, 2, 1, 3])]).toEqual([3, 1, 2]);
    });
  });

  describe('reduce', () => {
    it('reduces to sum', () => {
      expect(reduce([1, 2, 3, 4], (acc, x) => acc + x, 0)).toBe(10);
    });

    it('handles empty iterable', () => {
      expect(reduce([], (acc: number, x: number) => acc + x, 42)).toBe(42);
    });

    it('reduces to object', () => {
      const result = reduce(
        ['a', 'b', 'c'],
        (acc, item) => ({ ...acc, [item]: true }),
        {} as Record<string, boolean>
      );
      expect(result).toEqual({ a: true, b: true, c: true });
    });
  });

  describe('toArray', () => {
    it('converts generator to array', () => {
      expect(toArray(range(3))).toEqual([0, 1, 2]);
    });

    it('converts set to array', () => {
      expect(toArray(new Set([1, 2, 3]))).toEqual([1, 2, 3]);
    });
  });

  describe('cycle', () => {
    it('repeats items infinitely', () => {
      expect([...take(cycle([1, 2, 3]), 7)]).toEqual([1, 2, 3, 1, 2, 3, 1]);
    });

    it('handles single item', () => {
      expect([...take(cycle([42]), 3)]).toEqual([42, 42, 42]);
    });

    it('handles empty iterable', () => {
      expect([...take(cycle([]), 5)]).toEqual([]);
    });
  });

  describe('composition', () => {
    it('chains operations', () => {
      const result = toArray(
        take(
          filter(
            map(range(100), (x) => x * x),
            (x) => x % 2 === 0
          ),
          5
        )
      );
      expect(result).toEqual([0, 4, 16, 36, 64]);
    });

    it('chunk + flatten roundtrip', () => {
      const original = [1, 2, 3, 4, 5, 6];
      const result = toArray(flatten(chunk(original, 2)));
      expect(result).toEqual(original);
    });
  });
});
