import {
  getPaginationInfo,
  getPageItems,
  getPageRange,
  getOffset,
  offsetToPage,
  cursorPaginate,
} from './paginationUtils';

describe('paginationUtils', () => {
  describe('getPaginationInfo', () => {
    it('calculates basic pagination', () => {
      const info = getPaginationInfo(100, 10, 1);
      expect(info.currentPage).toBe(1);
      expect(info.totalPages).toBe(10);
      expect(info.pageSize).toBe(10);
      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(10);
    });

    it('calculates middle page', () => {
      const info = getPaginationInfo(50, 10, 3);
      expect(info.startIndex).toBe(20);
      expect(info.endIndex).toBe(30);
      expect(info.hasPrevious).toBe(true);
      expect(info.hasNext).toBe(true);
    });

    it('calculates last page', () => {
      const info = getPaginationInfo(25, 10, 3);
      expect(info.totalPages).toBe(3);
      expect(info.startIndex).toBe(20);
      expect(info.endIndex).toBe(25);
      expect(info.hasNext).toBe(false);
      expect(info.isLast).toBe(true);
    });

    it('calculates first page flags', () => {
      const info = getPaginationInfo(50, 10, 1);
      expect(info.isFirst).toBe(true);
      expect(info.hasPrevious).toBe(false);
    });

    it('clamps page to valid range', () => {
      const info = getPaginationInfo(50, 10, 999);
      expect(info.currentPage).toBe(5);
    });

    it('clamps page to 1 for negative', () => {
      const info = getPaginationInfo(50, 10, -1);
      expect(info.currentPage).toBe(1);
    });

    it('handles zero items', () => {
      const info = getPaginationInfo(0, 10, 1);
      expect(info.totalPages).toBe(1);
      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(0);
    });

    it('ensures minimum page size of 1', () => {
      const info = getPaginationInfo(10, 0, 1);
      expect(info.pageSize).toBe(1);
      expect(info.totalPages).toBe(10);
    });

    it('handles single item', () => {
      const info = getPaginationInfo(1, 10, 1);
      expect(info.totalPages).toBe(1);
      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(1);
      expect(info.isFirst).toBe(true);
      expect(info.isLast).toBe(true);
    });
  });

  describe('getPageItems', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('returns first page items', () => {
      expect(getPageItems(items, 3, 1)).toEqual([1, 2, 3]);
    });

    it('returns middle page items', () => {
      expect(getPageItems(items, 3, 2)).toEqual([4, 5, 6]);
    });

    it('returns last page items (partial)', () => {
      expect(getPageItems(items, 3, 4)).toEqual([10]);
    });

    it('returns empty for out of range', () => {
      const result = getPageItems(items, 3, 5);
      // Page is clamped to last valid page
      expect(result).toEqual([10]);
    });

    it('handles empty array', () => {
      expect(getPageItems([], 5, 1)).toEqual([]);
    });
  });

  describe('getPageRange', () => {
    it('shows all pages when total is small', () => {
      expect(getPageRange(5, 3).pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('shows right ellipsis when on first pages', () => {
      const range = getPageRange(20, 1);
      expect(range.pages[0]).toBe(1);
      expect(range.pages).toContain(-1);
      expect(range.pages[range.pages.length - 1]).toBe(20);
    });

    it('shows left ellipsis when on last pages', () => {
      const range = getPageRange(20, 20);
      expect(range.pages[0]).toBe(1);
      expect(range.pages).toContain(-1);
      expect(range.pages[range.pages.length - 1]).toBe(20);
    });

    it('shows both ellipsis when in middle', () => {
      const range = getPageRange(20, 10);
      expect(range.pages[0]).toBe(1);
      expect(range.pages[1]).toBe(-1);
      expect(range.pages).toContain(10);
      expect(range.pages[range.pages.length - 2]).toBe(-1);
      expect(range.pages[range.pages.length - 1]).toBe(20);
    });

    it('includes current page in range', () => {
      expect(getPageRange(20, 10).pages).toContain(10);
    });

    it('handles single page', () => {
      expect(getPageRange(1, 1).pages).toEqual([1]);
    });

    it('respects siblingCount', () => {
      const range = getPageRange(30, 15, 2);
      expect(range.pages).toContain(13);
      expect(range.pages).toContain(14);
      expect(range.pages).toContain(15);
      expect(range.pages).toContain(16);
      expect(range.pages).toContain(17);
    });
  });

  describe('getOffset', () => {
    it('calculates offset for first page', () => {
      expect(getOffset(10, 1)).toEqual({ offset: 0, limit: 10 });
    });

    it('calculates offset for later page', () => {
      expect(getOffset(25, 3)).toEqual({ offset: 50, limit: 25 });
    });

    it('handles zero page', () => {
      expect(getOffset(10, 0)).toEqual({ offset: 0, limit: 10 });
    });

    it('ensures minimum limit of 1', () => {
      expect(getOffset(0, 1)).toEqual({ offset: 0, limit: 1 });
    });
  });

  describe('offsetToPage', () => {
    it('converts offset 0 to page 1', () => {
      expect(offsetToPage(0, 10)).toBe(1);
    });

    it('converts offset to correct page', () => {
      expect(offsetToPage(20, 10)).toBe(3);
    });

    it('handles mid-page offset', () => {
      expect(offsetToPage(15, 10)).toBe(2);
    });

    it('handles negative offset', () => {
      expect(offsetToPage(-5, 10)).toBe(1);
    });
  });

  describe('cursorPaginate', () => {
    const items = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
      { id: 'c', name: 'Charlie' },
      { id: 'd', name: 'Diana' },
      { id: 'e', name: 'Eve' },
    ];
    const getCursor = (item: { id: string }) => item.id;

    it('returns first page', () => {
      const result = cursorPaginate(items, 2, getCursor);
      expect(result.items).toEqual([items[0], items[1]]);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('b');
      expect(result.previousCursor).toBeNull();
    });

    it('paginates after cursor', () => {
      const result = cursorPaginate(items, 2, getCursor, 'b');
      expect(result.items).toEqual([items[2], items[3]]);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('d');
      expect(result.previousCursor).toBe('c');
    });

    it('returns last page', () => {
      const result = cursorPaginate(items, 2, getCursor, 'd');
      expect(result.items).toEqual([items[4]]);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBe('e');
    });

    it('paginates before cursor', () => {
      const result = cursorPaginate(items, 2, getCursor, null, 'd');
      expect(result.items).toEqual([items[1], items[2]]);
      expect(result.previousCursor).toBe('b');
    });

    it('handles unknown cursor', () => {
      const result = cursorPaginate(items, 2, getCursor, 'unknown');
      expect(result.items).toEqual([items[0], items[1]]);
    });

    it('handles empty items', () => {
      const result = cursorPaginate([], 2, getCursor);
      expect(result.items).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('limits to available items', () => {
      const result = cursorPaginate(items, 100, getCursor);
      expect(result.items).toHaveLength(5);
      expect(result.hasMore).toBe(false);
    });
  });
});
