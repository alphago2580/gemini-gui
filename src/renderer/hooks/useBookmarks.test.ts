import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks, BookmarkedMessage } from './useBookmarks';

const mockBookmark: BookmarkedMessage = {
  conversationId: 'conv-1',
  conversationTitle: 'Test Conversation',
  messageIndex: 0,
  role: 'user',
  content: 'Hello world',
  timestamp: new Date('2026-01-01'),
};

const mockBookmark2: BookmarkedMessage = {
  conversationId: 'conv-1',
  conversationTitle: 'Test Conversation',
  messageIndex: 2,
  role: 'assistant',
  content: 'Hi there',
  timestamp: new Date('2026-01-01'),
};

const makeBookmark = (overrides: Partial<BookmarkedMessage> = {}): BookmarkedMessage => ({
  conversationId: 'conv-1',
  conversationTitle: 'Test Conversation',
  messageIndex: 0,
  role: 'user',
  content: 'Hello world',
  timestamp: new Date('2025-01-01'),
  ...overrides,
});

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty bookmarks initially', () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toEqual([]);
  });

  it('adds a bookmark', () => {
    const { result } = renderHook(() => useBookmarks());
    const bm = makeBookmark();

    act(() => {
      result.current.addBookmark(bm);
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].content).toBe('Hello world');
  });

  it('prevents duplicate bookmarks', () => {
    const { result } = renderHook(() => useBookmarks());
    const bm = makeBookmark();

    act(() => {
      result.current.addBookmark(bm);
    });
    act(() => {
      result.current.addBookmark(bm);
    });

    expect(result.current.bookmarks).toHaveLength(1);
  });

  it('allows same conversation different message index', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark({ messageIndex: 0 }));
    });
    act(() => {
      result.current.addBookmark(makeBookmark({ messageIndex: 1 }));
    });

    expect(result.current.bookmarks).toHaveLength(2);
  });

  it('removes a bookmark', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(mockBookmark));
    act(() => result.current.addBookmark(mockBookmark2));
    expect(result.current.bookmarks).toHaveLength(2);
    act(() => result.current.removeBookmark('conv-1', 0));
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].messageIndex).toBe(2);
  });

  it('removeBookmark is no-op for non-existent bookmark', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark());
    });
    act(() => {
      result.current.removeBookmark('conv-1', 99);
    });

    expect(result.current.bookmarks).toHaveLength(1);
  });

  it('toggleBookmark adds when not bookmarked', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.toggleBookmark(mockBookmark));
    expect(result.current.bookmarks).toHaveLength(1);
  });

  it('toggleBookmark removes when already bookmarked', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(mockBookmark));
    act(() => result.current.toggleBookmark(mockBookmark));
    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('isBookmarked returns true for existing bookmark', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark());
    });

    expect(result.current.isBookmarked('conv-1', 0)).toBe(true);
    expect(result.current.isBookmarked('conv-1', 1)).toBe(false);
    expect(result.current.isBookmarked('conv-2', 0)).toBe(false);
  });

  it('clearBookmarks removes all bookmarks', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark({ messageIndex: 0 }));
    });
    act(() => {
      result.current.addBookmark(makeBookmark({ messageIndex: 1 }));
    });
    act(() => {
      result.current.clearBookmarks();
    });

    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('getBookmarksForConversation filters by conversation', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'conv-1', messageIndex: 0 }));
    });
    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'conv-1', messageIndex: 1 }));
    });
    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'conv-2', messageIndex: 0 }));
    });

    expect(result.current.getBookmarksForConversation('conv-1')).toHaveLength(2);
    expect(result.current.getBookmarksForConversation('conv-2')).toHaveLength(1);
    expect(result.current.getBookmarksForConversation('conv-3')).toHaveLength(0);
  });

  it('persists bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark(makeBookmark());
    });

    const stored = JSON.parse(localStorage.getItem('gemini-bookmarks') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe('Hello world');
  });

  it('loads bookmarks from localStorage on mount', () => {
    const bm = makeBookmark();
    localStorage.setItem('gemini-bookmarks', JSON.stringify([bm]));

    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].content).toBe('Hello world');
  });

  it('returns stable function references', () => {
    const { result, rerender } = renderHook(() => useBookmarks());
    const first = result.current;
    rerender();
    const second = result.current;

    expect(first.addBookmark).toBe(second.addBookmark);
    expect(first.removeBookmark).toBe(second.removeBookmark);
    expect(first.clearBookmarks).toBe(second.clearBookmarks);
  });

  it('addBookmark allows different conversations same messageIndex', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 0 }));
      result.current.addBookmark(makeBookmark({ conversationId: 'c2', messageIndex: 0 }));
    });
    expect(result.current.bookmarks).toHaveLength(2);
  });

  it('toggleBookmark twice returns to original state', () => {
    const { result } = renderHook(() => useBookmarks());
    const bm = makeBookmark();
    act(() => result.current.toggleBookmark(bm));
    expect(result.current.bookmarks).toHaveLength(1);
    act(() => result.current.toggleBookmark(bm));
    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('removeBookmark with wrong conversationId does not remove', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 0 })));
    act(() => result.current.removeBookmark('wrong-id', 0));
    expect(result.current.bookmarks).toHaveLength(1);
  });

  it('isBookmarked after removeBookmark returns false', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 5 })));
    expect(result.current.isBookmarked('c1', 5)).toBe(true);
    act(() => result.current.removeBookmark('c1', 5));
    expect(result.current.isBookmarked('c1', 5)).toBe(false);
  });

  it('clearBookmarks then addBookmark works', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(makeBookmark()));
    act(() => result.current.clearBookmarks());
    act(() => result.current.addBookmark(makeBookmark({ messageIndex: 10 })));
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].messageIndex).toBe(10);
  });

  it('getBookmarksForConversation preserves bookmark order', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 3 }));
      result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 1 }));
      result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 7 }));
    });
    const bms = result.current.getBookmarksForConversation('c1');
    expect(bms.map(b => b.messageIndex)).toEqual([3, 1, 7]);
  });

  it('bookmark stores role correctly', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => {
      result.current.addBookmark(makeBookmark({ role: 'assistant', messageIndex: 0 }));
      result.current.addBookmark(makeBookmark({ role: 'user', messageIndex: 1 }));
    });
    expect(result.current.bookmarks[0].role).toBe('assistant');
    expect(result.current.bookmarks[1].role).toBe('user');
  });

  it('multiple conversations bookmarks are independent', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => {
      result.current.addBookmark(makeBookmark({ conversationId: 'c1', messageIndex: 0 }));
      result.current.addBookmark(makeBookmark({ conversationId: 'c2', messageIndex: 0 }));
    });
    act(() => result.current.removeBookmark('c1', 0));
    expect(result.current.getBookmarksForConversation('c1')).toHaveLength(0);
    expect(result.current.getBookmarksForConversation('c2')).toHaveLength(1);
  });
});
