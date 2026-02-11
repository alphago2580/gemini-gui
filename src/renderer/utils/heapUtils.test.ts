import { describe, it, expect } from 'vitest';
import {
  BinaryHeap,
  createMinHeap,
  createMaxHeap,
  heapify,
  nSmallest,
  nLargest,
  isMinHeap,
  mergeHeaps,
} from './heapUtils';

describe('heapUtils', () => {
  describe('BinaryHeap', () => {
    it('starts empty', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('push increases size', () => {
      const heap = new BinaryHeap<number>();
      heap.push(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
    });

    it('peek returns the minimum element (min-heap)', () => {
      const heap = new BinaryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
    });

    it('pop removes and returns the minimum element', () => {
      const heap = new BinaryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('pop returns undefined on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.pop()).toBeUndefined();
    });

    it('peek returns undefined on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('maintains min-heap property after multiple pushes', () => {
      const heap = new BinaryHeap<number>();
      const values = [10, 4, 8, 1, 6, 3, 9, 2, 7, 5];
      for (const v of values) heap.push(v);

      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.pop()!);
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('toArray returns copy of internal array', () => {
      const heap = new BinaryHeap<number>();
      heap.push(1);
      heap.push(2);
      const arr = heap.toArray();
      expect(arr).toHaveLength(2);
      arr.push(99);
      expect(heap.size).toBe(2);
    });

    it('clear empties the heap', () => {
      const heap = new BinaryHeap<number>();
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('contains checks for element presence', () => {
      const heap = new BinaryHeap<number>();
      heap.push(1);
      heap.push(2);
      expect(heap.contains(1)).toBe(true);
      expect(heap.contains(3)).toBe(false);
    });

    it('works with string values', () => {
      const heap = new BinaryHeap<string>();
      heap.push('banana');
      heap.push('apple');
      heap.push('cherry');
      expect(heap.pop()).toBe('apple');
      expect(heap.pop()).toBe('banana');
      expect(heap.pop()).toBe('cherry');
    });

    it('works with custom compare function', () => {
      // Max-heap via reversed compare
      const heap = new BinaryHeap<number>((a, b) => b - a);
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.pop()).toBe(7);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(3);
    });

    it('handles duplicate values', () => {
      const heap = new BinaryHeap<number>();
      heap.push(5);
      heap.push(5);
      heap.push(5);
      expect(heap.size).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(5);
    });

    it('handles single element', () => {
      const heap = new BinaryHeap<number>();
      heap.push(42);
      expect(heap.peek()).toBe(42);
      expect(heap.pop()).toBe(42);
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('createMinHeap', () => {
    it('creates a min-heap', () => {
      const heap = createMinHeap<number>();
      heap.push(5);
      heap.push(2);
      heap.push(8);
      expect(heap.peek()).toBe(2);
    });

    it('extracts elements in ascending order', () => {
      const heap = createMinHeap<number>();
      [5, 3, 7, 1, 4].forEach(v => heap.push(v));
      const result: number[] = [];
      while (!heap.isEmpty) result.push(heap.pop()!);
      expect(result).toEqual([1, 3, 4, 5, 7]);
    });
  });

  describe('createMaxHeap', () => {
    it('creates a max-heap', () => {
      const heap = createMaxHeap<number>();
      heap.push(5);
      heap.push(2);
      heap.push(8);
      expect(heap.peek()).toBe(8);
    });

    it('extracts elements in descending order', () => {
      const heap = createMaxHeap<number>();
      [5, 3, 7, 1, 4].forEach(v => heap.push(v));
      const result: number[] = [];
      while (!heap.isEmpty) result.push(heap.pop()!);
      expect(result).toEqual([7, 5, 4, 3, 1]);
    });

    it('works with strings', () => {
      const heap = createMaxHeap<string>();
      heap.push('apple');
      heap.push('cherry');
      heap.push('banana');
      expect(heap.peek()).toBe('cherry');
    });
  });

  describe('heapify', () => {
    it('creates a heap from an array', () => {
      const heap = heapify([5, 3, 7, 1, 4]);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(3);
    });

    it('handles empty array', () => {
      const heap = heapify([]);
      expect(heap.isEmpty).toBe(true);
    });

    it('handles single element', () => {
      const heap = heapify([42]);
      expect(heap.peek()).toBe(42);
      expect(heap.size).toBe(1);
    });
  });

  describe('nSmallest', () => {
    it('returns n smallest elements', () => {
      expect(nSmallest([5, 3, 7, 1, 4], 3)).toEqual([1, 3, 4]);
    });

    it('returns all elements when n >= array length', () => {
      expect(nSmallest([5, 3, 1], 5)).toEqual([1, 3, 5]);
    });

    it('returns empty for n = 0', () => {
      expect(nSmallest([5, 3, 1], 0)).toEqual([]);
    });

    it('returns empty for empty array', () => {
      expect(nSmallest([], 3)).toEqual([]);
    });

    it('returns single element', () => {
      expect(nSmallest([5, 3, 7, 1], 1)).toEqual([1]);
    });
  });

  describe('nLargest', () => {
    it('returns n largest elements', () => {
      expect(nLargest([5, 3, 7, 1, 4], 3)).toEqual([7, 5, 4]);
    });

    it('returns all elements when n >= array length', () => {
      expect(nLargest([5, 3, 1], 5)).toEqual([5, 3, 1]);
    });

    it('returns empty for n = 0', () => {
      expect(nLargest([5, 3, 1], 0)).toEqual([]);
    });

    it('returns single element', () => {
      expect(nLargest([5, 3, 7, 1], 1)).toEqual([7]);
    });
  });

  describe('isMinHeap', () => {
    it('returns true for valid min-heap', () => {
      expect(isMinHeap([1, 2, 3, 4, 5])).toBe(true);
    });

    it('returns false for invalid min-heap', () => {
      expect(isMinHeap([5, 2, 3, 4, 1])).toBe(false);
    });

    it('returns true for empty array', () => {
      expect(isMinHeap([])).toBe(true);
    });

    it('returns true for single element', () => {
      expect(isMinHeap([42])).toBe(true);
    });

    it('returns true for all same elements', () => {
      expect(isMinHeap([5, 5, 5, 5])).toBe(true);
    });
  });

  describe('mergeHeaps', () => {
    it('merges two heaps', () => {
      const h1 = createMinHeap<number>();
      h1.push(1);
      h1.push(3);

      const h2 = createMinHeap<number>();
      h2.push(2);
      h2.push(4);

      const merged = mergeHeaps(h1, h2);
      expect(merged.size).toBe(4);
      expect(merged.pop()).toBe(1);
      expect(merged.pop()).toBe(2);
      expect(merged.pop()).toBe(3);
      expect(merged.pop()).toBe(4);
    });

    it('merges with empty heap', () => {
      const h1 = createMinHeap<number>();
      h1.push(1);
      h1.push(2);

      const h2 = createMinHeap<number>();

      const merged = mergeHeaps(h1, h2);
      expect(merged.size).toBe(2);
    });

    it('merges two empty heaps', () => {
      const h1 = createMinHeap<number>();
      const h2 = createMinHeap<number>();

      const merged = mergeHeaps(h1, h2);
      expect(merged.isEmpty).toBe(true);
    });

    it('does not modify original heaps', () => {
      const h1 = createMinHeap<number>();
      h1.push(1);

      const h2 = createMinHeap<number>();
      h2.push(2);

      mergeHeaps(h1, h2);

      expect(h1.size).toBe(1);
      expect(h2.size).toBe(1);
    });
  });
});
