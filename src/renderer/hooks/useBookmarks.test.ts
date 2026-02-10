import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from './useBookmarks';
import type { BookmarkedMessage } from '../components/BookmarkedMessages';

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

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty bookmarks', () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toEqual([]);
  });

  it('adds a bookmark', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(mockBookmark));
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].conversationId).toBe('conv-1');
  });

  it('does not add duplicate bookmarks', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(mockBookmark));
    act(() => result.current.addBookmark(mockBookmark));
    expect(result.current.bookmarks).toHaveLength(1);
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
    act(() => result.current.addBookmark(mockBookmark));
    expect(result.current.isBookmarked('conv-1', 0)).toBe(true);
  });

  it('isBookmarked returns false for non-existing bookmark', () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.isBookmarked('conv-1', 0)).toBe(false);
  });

  it('persists bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmarks());
    act(() => result.current.addBookmark(mockBookmark));
    const stored = JSON.parse(localStorage.getItem('gemini-bookmarks') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].conversationId).toBe('conv-1');
  });

  it('loads bookmarks from localStorage', () => {
    localStorage.setItem('gemini-bookmarks', JSON.stringify([mockBookmark]));
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].content).toBe('Hello world');
  });
});
