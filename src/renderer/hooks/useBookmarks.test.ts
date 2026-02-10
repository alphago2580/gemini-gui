import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from './useBookmarks';

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty bookmarks initially', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test Conversation'));
    expect(result.current.bookmarks).toHaveLength(0);
    expect(result.current.bookmarkCount).toBe(0);
  });

  it('toggleBookmark adds a bookmark', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test Conversation'));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello world');
    });
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].conversationId).toBe('conv-1');
    expect(result.current.bookmarks[0].messageIndex).toBe(0);
    expect(result.current.bookmarks[0].role).toBe('user');
    expect(result.current.bookmarks[0].content).toBe('Hello world');
    expect(result.current.bookmarkCount).toBe(1);
  });

  it('toggleBookmark removes an existing bookmark', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test Conversation'));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello world');
    });
    expect(result.current.bookmarks).toHaveLength(1);
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello world');
    });
    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('isBookmarked returns correct state', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test Conversation'));
    expect(result.current.isBookmarked(0)).toBe(false);
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello');
    });
    expect(result.current.isBookmarked(0)).toBe(true);
    expect(result.current.isBookmarked(1)).toBe(false);
  });

  it('removeBookmark removes by conversationId and messageIndex', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test Conversation'));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'First');
      result.current.toggleBookmark(1, 'assistant', 'Second');
    });
    expect(result.current.bookmarks).toHaveLength(2);
    act(() => {
      result.current.removeBookmark('conv-1', 0);
    });
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].messageIndex).toBe(1);
  });

  it('does nothing when conversationId is null', () => {
    const { result } = renderHook(() => useBookmarks(null, ''));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello');
    });
    expect(result.current.bookmarks).toHaveLength(0);
    expect(result.current.isBookmarked(0)).toBe(false);
  });

  it('persists bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'Test'));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Saved');
    });
    const stored = JSON.parse(localStorage.getItem('gemini-bookmarks') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe('Saved');
  });

  it('stores conversationTitle in bookmark', () => {
    const { result } = renderHook(() => useBookmarks('conv-1', 'My Chat'));
    act(() => {
      result.current.toggleBookmark(0, 'user', 'Hello');
    });
    expect(result.current.bookmarks[0].conversationTitle).toBe('My Chat');
  });
});
