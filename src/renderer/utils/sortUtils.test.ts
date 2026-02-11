import { describe, it, expect } from 'vitest';
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  isSorted,
  shuffle,
  sortByKey,
  stableSort,
} from './sortUtils';

const unsorted = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
const sorted = [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9];
const descCompare = (a: number, b: number) => b - a;

describe('sortUtils', () => {
  describe('bubbleSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(bubbleSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator (descending)', () => {
      expect(bubbleSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(bubbleSort([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(bubbleSort([1])).toEqual([1]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      bubbleSort(original);
      expect(original).toEqual([3, 1, 2]);
    });

    it('handles already sorted array', () => {
      expect(bubbleSort([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('selectionSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(selectionSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator', () => {
      expect(selectionSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(selectionSort([])).toEqual([]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      selectionSort(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('insertionSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(insertionSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator', () => {
      expect(insertionSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(insertionSort([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(insertionSort([42])).toEqual([42]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      insertionSort(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('mergeSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(mergeSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator', () => {
      expect(mergeSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(mergeSort([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(mergeSort([1])).toEqual([1]);
    });

    it('sorts strings alphabetically', () => {
      expect(mergeSort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry']);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      mergeSort(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('quickSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(quickSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator', () => {
      expect(quickSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(quickSort([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(quickSort([1])).toEqual([1]);
    });

    it('handles already sorted array', () => {
      expect(quickSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles reverse sorted array', () => {
      expect(quickSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      quickSort(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('heapSort', () => {
    it('sorts numbers in ascending order', () => {
      expect(heapSort(unsorted)).toEqual(sorted);
    });

    it('sorts with custom comparator', () => {
      expect(heapSort([3, 1, 2], descCompare)).toEqual([3, 2, 1]);
    });

    it('handles empty array', () => {
      expect(heapSort([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(heapSort([1])).toEqual([1]);
    });

    it('handles all same elements', () => {
      expect(heapSort([5, 5, 5])).toEqual([5, 5, 5]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      heapSort(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      expect(isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('returns false for unsorted array', () => {
      expect(isSorted([3, 1, 2])).toBe(false);
    });

    it('returns true for empty array', () => {
      expect(isSorted([])).toBe(true);
    });

    it('returns true for single element', () => {
      expect(isSorted([1])).toBe(true);
    });

    it('works with custom comparator', () => {
      expect(isSorted([3, 2, 1], descCompare)).toBe(true);
    });

    it('returns true for array with equal elements', () => {
      expect(isSorted([5, 5, 5])).toBe(true);
    });

    it('returns false for descending with default compare', () => {
      expect(isSorted([3, 2, 1])).toBe(false);
    });
  });

  describe('shuffle', () => {
    it('returns an array of the same length', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(shuffle(arr)).toHaveLength(5);
    });

    it('contains the same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('does not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      shuffle(original);
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(shuffle([1])).toEqual([1]);
    });
  });

  describe('sortByKey', () => {
    it('sorts objects by key ascending', () => {
      const arr = [{ name: 'Charlie', age: 30 }, { name: 'Alice', age: 25 }, { name: 'Bob', age: 35 }];
      expect(sortByKey(arr, 'name')).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'Charlie', age: 30 },
      ]);
    });

    it('sorts objects by key descending', () => {
      const arr = [{ age: 25 }, { age: 35 }, { age: 30 }];
      expect(sortByKey(arr, 'age', false)).toEqual([
        { age: 35 },
        { age: 30 },
        { age: 25 },
      ]);
    });

    it('does not mutate original array', () => {
      const original = [{ a: 3 }, { a: 1 }, { a: 2 }];
      sortByKey(original, 'a');
      expect(original[0].a).toBe(3);
    });

    it('handles empty array', () => {
      expect(sortByKey([], 'a')).toEqual([]);
    });
  });

  describe('stableSort', () => {
    it('preserves relative order of equal elements', () => {
      const arr = [
        { name: 'a', group: 1 },
        { name: 'b', group: 2 },
        { name: 'c', group: 1 },
        { name: 'd', group: 2 },
      ];
      const result = stableSort(arr, (a, b) => a.group - b.group);
      expect(result.map(x => x.name)).toEqual(['a', 'c', 'b', 'd']);
    });

    it('sorts numbers correctly', () => {
      expect(stableSort([3, 1, 2])).toEqual([1, 2, 3]);
    });

    it('handles empty array', () => {
      expect(stableSort([])).toEqual([]);
    });

    it('does not mutate original array', () => {
      const original = [3, 1, 2];
      stableSort(original);
      expect(original).toEqual([3, 1, 2]);
    });

    it('handles all same elements', () => {
      expect(stableSort([5, 5, 5])).toEqual([5, 5, 5]);
    });
  });

  describe('all sorts produce same result', () => {
    it('all algorithms sort identically', () => {
      const input = [9, 3, 7, 1, 5, 8, 2, 4, 6];
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      expect(bubbleSort(input)).toEqual(expected);
      expect(selectionSort(input)).toEqual(expected);
      expect(insertionSort(input)).toEqual(expected);
      expect(mergeSort(input)).toEqual(expected);
      expect(quickSort(input)).toEqual(expected);
      expect(heapSort(input)).toEqual(expected);
      expect(stableSort(input)).toEqual(expected);
    });

    it('all algorithms handle negative numbers', () => {
      const input = [-3, 0, 5, -1, 2, -4];
      const expected = [-4, -3, -1, 0, 2, 5];

      expect(bubbleSort(input)).toEqual(expected);
      expect(selectionSort(input)).toEqual(expected);
      expect(insertionSort(input)).toEqual(expected);
      expect(mergeSort(input)).toEqual(expected);
      expect(quickSort(input)).toEqual(expected);
      expect(heapSort(input)).toEqual(expected);
    });

    it('all algorithms handle duplicates', () => {
      const input = [2, 1, 2, 1, 2];
      const expected = [1, 1, 2, 2, 2];

      expect(bubbleSort(input)).toEqual(expected);
      expect(selectionSort(input)).toEqual(expected);
      expect(insertionSort(input)).toEqual(expected);
      expect(mergeSort(input)).toEqual(expected);
      expect(quickSort(input)).toEqual(expected);
      expect(heapSort(input)).toEqual(expected);
    });
  });
});
