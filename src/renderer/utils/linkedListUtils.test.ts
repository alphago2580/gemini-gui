import { describe, it, expect, vi } from 'vitest';
import { LinkedList } from './linkedListUtils';

describe('LinkedList', () => {
  describe('construction', () => {
    it('creates empty list', () => {
      const list = new LinkedList<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
      expect(list.head).toBeNull();
    });

    it('creates from array', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.size).toBe(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('creates from empty array', () => {
      const list = LinkedList.from<number>([]);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('append', () => {
    it('appends to empty list', () => {
      const list = new LinkedList<number>();
      list.append(1);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(1);
    });

    it('appends to non-empty list', () => {
      const list = LinkedList.from([1, 2]);
      list.append(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('prepend', () => {
    it('prepends to empty list', () => {
      const list = new LinkedList<number>();
      list.prepend(1);
      expect(list.get(0)).toBe(1);
    });

    it('prepends to non-empty list', () => {
      const list = LinkedList.from([2, 3]);
      list.prepend(1);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('insertAt', () => {
    it('inserts at beginning', () => {
      const list = LinkedList.from([2, 3]);
      expect(list.insertAt(0, 1)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('inserts in middle', () => {
      const list = LinkedList.from([1, 3]);
      expect(list.insertAt(1, 2)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('inserts at end', () => {
      const list = LinkedList.from([1, 2]);
      expect(list.insertAt(2, 3)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('returns false for invalid index', () => {
      const list = LinkedList.from([1]);
      expect(list.insertAt(-1, 0)).toBe(false);
      expect(list.insertAt(5, 0)).toBe(false);
    });
  });

  describe('removeFirst', () => {
    it('removes from non-empty list', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.removeFirst()).toBe(1);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it('returns undefined from empty list', () => {
      const list = new LinkedList<number>();
      expect(list.removeFirst()).toBeUndefined();
    });

    it('removes single element', () => {
      const list = LinkedList.from([1]);
      expect(list.removeFirst()).toBe(1);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('removeLast', () => {
    it('removes from non-empty list', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.removeLast()).toBe(3);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('returns undefined from empty list', () => {
      const list = new LinkedList<number>();
      expect(list.removeLast()).toBeUndefined();
    });

    it('removes single element', () => {
      const list = LinkedList.from([1]);
      expect(list.removeLast()).toBe(1);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('removeAt', () => {
    it('removes at index', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.removeAt(1)).toBe(2);
      expect(list.toArray()).toEqual([1, 3]);
    });

    it('removes first element', () => {
      const list = LinkedList.from([1, 2]);
      expect(list.removeAt(0)).toBe(1);
      expect(list.toArray()).toEqual([2]);
    });

    it('returns undefined for invalid index', () => {
      const list = LinkedList.from([1]);
      expect(list.removeAt(-1)).toBeUndefined();
      expect(list.removeAt(5)).toBeUndefined();
    });
  });

  describe('get', () => {
    it('gets element at index', () => {
      const list = LinkedList.from([10, 20, 30]);
      expect(list.get(0)).toBe(10);
      expect(list.get(1)).toBe(20);
      expect(list.get(2)).toBe(30);
    });

    it('returns undefined for invalid index', () => {
      const list = LinkedList.from([1]);
      expect(list.get(-1)).toBeUndefined();
      expect(list.get(5)).toBeUndefined();
    });
  });

  describe('indexOf', () => {
    it('finds existing element', () => {
      const list = LinkedList.from([10, 20, 30]);
      expect(list.indexOf(20)).toBe(1);
    });

    it('returns -1 for non-existent element', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.indexOf(99)).toBe(-1);
    });
  });

  describe('contains', () => {
    it('returns true for existing element', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.contains(2)).toBe(true);
    });

    it('returns false for non-existent element', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.contains(99)).toBe(false);
    });
  });

  describe('find', () => {
    it('finds matching element', () => {
      const list = LinkedList.from([1, 2, 3, 4]);
      expect(list.find(v => v > 2)).toBe(3);
    });

    it('returns undefined when no match', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.find(v => v > 10)).toBeUndefined();
    });
  });

  describe('reverse', () => {
    it('reverses list', () => {
      const list = LinkedList.from([1, 2, 3]);
      list.reverse();
      expect(list.toArray()).toEqual([3, 2, 1]);
    });

    it('reverses single element', () => {
      const list = LinkedList.from([1]);
      list.reverse();
      expect(list.toArray()).toEqual([1]);
    });

    it('reverses empty list', () => {
      const list = new LinkedList<number>();
      list.reverse();
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('map', () => {
    it('maps values', () => {
      const list = LinkedList.from([1, 2, 3]);
      const doubled = list.map(v => v * 2);
      expect(doubled.toArray()).toEqual([2, 4, 6]);
    });

    it('provides index', () => {
      const list = LinkedList.from(['a', 'b']);
      const result = list.map((v, i) => `${i}:${v}`);
      expect(result.toArray()).toEqual(['0:a', '1:b']);
    });
  });

  describe('filter', () => {
    it('filters values', () => {
      const list = LinkedList.from([1, 2, 3, 4, 5]);
      const evens = list.filter(v => v % 2 === 0);
      expect(evens.toArray()).toEqual([2, 4]);
    });

    it('returns empty for no matches', () => {
      const list = LinkedList.from([1, 3, 5]);
      const evens = list.filter(v => v % 2 === 0);
      expect(evens.isEmpty).toBe(true);
    });
  });

  describe('forEach', () => {
    it('iterates all elements', () => {
      const list = LinkedList.from([1, 2, 3]);
      const fn = vi.fn();
      list.forEach(fn);
      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn).toHaveBeenCalledWith(1, 0);
      expect(fn).toHaveBeenCalledWith(2, 1);
      expect(fn).toHaveBeenCalledWith(3, 2);
    });
  });

  describe('clear', () => {
    it('clears all elements', () => {
      const list = LinkedList.from([1, 2, 3]);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
      expect(list.head).toBeNull();
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      const original = LinkedList.from([1, 2, 3]);
      const clone = original.clone();
      expect(clone.toArray()).toEqual([1, 2, 3]);

      clone.append(4);
      expect(original.size).toBe(3);
      expect(clone.size).toBe(4);
    });
  });

  describe('toArray', () => {
    it('converts to array', () => {
      const list = LinkedList.from([1, 2, 3]);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('returns empty array for empty list', () => {
      const list = new LinkedList<number>();
      expect(list.toArray()).toEqual([]);
    });
  });

  describe('with strings', () => {
    it('works with string values', () => {
      const list = LinkedList.from(['hello', 'world']);
      expect(list.contains('hello')).toBe(true);
      expect(list.indexOf('world')).toBe(1);
      list.reverse();
      expect(list.toArray()).toEqual(['world', 'hello']);
    });
  });
});
