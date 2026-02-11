/**
 * Pagination utilities for managing paginated data.
 */

export interface PaginationInfo {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Start index (0-indexed) for current page */
  startIndex: number;
  /** End index (exclusive, 0-indexed) for current page */
  endIndex: number;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether this is the first page */
  isFirst: boolean;
  /** Whether this is the last page */
  isLast: boolean;
}

export interface PageRange {
  /** Array of page numbers or ellipsis markers (-1) */
  pages: number[];
}

/** Calculate pagination info for a given page. */
export function getPaginationInfo(
  totalItems: number,
  pageSize: number,
  currentPage: number
): PaginationInfo {
  const safeTotalItems = Math.max(0, Math.floor(totalItems));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(currentPage)), totalPages);

  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, safeTotalItems);

  return {
    currentPage: safePage,
    totalPages,
    totalItems: safeTotalItems,
    pageSize: safePageSize,
    startIndex,
    endIndex,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
    isFirst: safePage === 1,
    isLast: safePage === totalPages,
  };
}

/** Get a slice of items for the current page. */
export function getPageItems<T>(items: T[], pageSize: number, currentPage: number): T[] {
  const info = getPaginationInfo(items.length, pageSize, currentPage);
  return items.slice(info.startIndex, info.endIndex);
}

/**
 * Generate a page range with ellipsis for UI rendering.
 * Returns an array of page numbers where -1 represents an ellipsis.
 *
 * @param totalPages Total number of pages
 * @param currentPage Current page (1-indexed)
 * @param siblingCount Number of pages to show on each side of current page
 */
export function getPageRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number = 1
): PageRange {
  const safeTotalPages = Math.max(1, Math.floor(totalPages));
  const safeCurrent = Math.min(Math.max(1, Math.floor(currentPage)), safeTotalPages);

  // If total pages is small enough, show all
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis
  if (safeTotalPages <= totalPageNumbers) {
    const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    return { pages };
  }

  const leftSibling = Math.max(safeCurrent - siblingCount, 1);
  const rightSibling = Math.min(safeCurrent + siblingCount, safeTotalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < safeTotalPages - 1;

  const pages: number[] = [];

  if (!showLeftEllipsis && showRightEllipsis) {
    // Show left pages, ellipsis, last page
    const leftCount = siblingCount * 2 + 3;
    for (let i = 1; i <= leftCount; i++) {
      pages.push(i);
    }
    pages.push(-1);
    pages.push(safeTotalPages);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    // Show first page, ellipsis, right pages
    pages.push(1);
    pages.push(-1);
    const rightCount = siblingCount * 2 + 3;
    for (let i = safeTotalPages - rightCount + 1; i <= safeTotalPages; i++) {
      pages.push(i);
    }
  } else {
    // Both ellipsis
    pages.push(1);
    pages.push(-1);
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }
    pages.push(-1);
    pages.push(safeTotalPages);
  }

  return { pages };
}

/** Calculate the offset for database-style pagination (OFFSET/LIMIT). */
export function getOffset(pageSize: number, currentPage: number): { offset: number; limit: number } {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safePage = Math.max(1, Math.floor(currentPage));
  return {
    offset: (safePage - 1) * safePageSize,
    limit: safePageSize,
  };
}

/** Convert an offset back to page number. */
export function offsetToPage(offset: number, pageSize: number): number {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safeOffset = Math.max(0, Math.floor(offset));
  return Math.floor(safeOffset / safePageSize) + 1;
}

/**
 * Create a cursor-based pagination result.
 * Extracts items for the page and returns cursor info.
 */
export interface CursorPaginationResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  previousCursor: string | null;
}

export function cursorPaginate<T>(
  items: T[],
  limit: number,
  getCursor: (item: T) => string,
  afterCursor?: string | null,
  beforeCursor?: string | null
): CursorPaginationResult<T> {
  const safeLimit = Math.max(1, Math.floor(limit));
  let startIdx = 0;

  if (afterCursor) {
    const cursorIdx = items.findIndex((item) => getCursor(item) === afterCursor);
    if (cursorIdx !== -1) {
      startIdx = cursorIdx + 1;
    }
  } else if (beforeCursor) {
    const cursorIdx = items.findIndex((item) => getCursor(item) === beforeCursor);
    if (cursorIdx !== -1) {
      startIdx = Math.max(0, cursorIdx - safeLimit);
    }
  }

  const slice = items.slice(startIdx, startIdx + safeLimit);
  const hasMore = startIdx + safeLimit < items.length;

  return {
    items: slice,
    hasMore,
    nextCursor: slice.length > 0 ? getCursor(slice[slice.length - 1]) : null,
    previousCursor: startIdx > 0 && slice.length > 0 ? getCursor(slice[0]) : null,
  };
}
