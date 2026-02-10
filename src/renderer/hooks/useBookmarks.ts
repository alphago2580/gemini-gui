import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { BookmarkedMessage } from '../components/BookmarkedMessages';
import { STORAGE_KEY_BOOKMARKS } from '../constants/strings';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkedMessage[]>(STORAGE_KEY_BOOKMARKS, []);

  const addBookmark = useCallback((bookmark: BookmarkedMessage) => {
    setBookmarks(prev => {
      const exists = prev.some(
        b => b.conversationId === bookmark.conversationId && b.messageIndex === bookmark.messageIndex
      );
      if (exists) return prev;
      return [...prev, bookmark];
    });
  }, [setBookmarks]);

  const removeBookmark = useCallback((conversationId: string, messageIndex: number) => {
    setBookmarks(prev =>
      prev.filter(b => !(b.conversationId === conversationId && b.messageIndex === messageIndex))
    );
  }, [setBookmarks]);

  const toggleBookmark = useCallback((bookmark: BookmarkedMessage) => {
    setBookmarks(prev => {
      const exists = prev.some(
        b => b.conversationId === bookmark.conversationId && b.messageIndex === bookmark.messageIndex
      );
      if (exists) {
        return prev.filter(
          b => !(b.conversationId === bookmark.conversationId && b.messageIndex === bookmark.messageIndex)
        );
      }
      return [...prev, bookmark];
    });
  }, [setBookmarks]);

  const isBookmarked = useCallback((conversationId: string, messageIndex: number): boolean => {
    return bookmarks.some(
      b => b.conversationId === conversationId && b.messageIndex === messageIndex
    );
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked };
}
