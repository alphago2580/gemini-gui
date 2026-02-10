import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { BookmarkedMessage } from '../components/BookmarkedMessages';

const STORAGE_KEY_BOOKMARKS = 'gemini-bookmarks';

export function useBookmarks(currentConversationId: string | null, currentConversationTitle: string) {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkedMessage[]>(STORAGE_KEY_BOOKMARKS, []);

  const isBookmarked = useCallback((messageIndex: number): boolean => {
    if (!currentConversationId) return false;
    return bookmarks.some(
      b => b.conversationId === currentConversationId && b.messageIndex === messageIndex
    );
  }, [bookmarks, currentConversationId]);

  const toggleBookmark = useCallback((messageIndex: number, role: 'user' | 'assistant', content: string) => {
    if (!currentConversationId) return;
    setBookmarks(prev => {
      const existingIndex = prev.findIndex(
        b => b.conversationId === currentConversationId && b.messageIndex === messageIndex
      );
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      }
      return [...prev, {
        conversationId: currentConversationId,
        conversationTitle: currentConversationTitle,
        messageIndex,
        role,
        content,
        timestamp: new Date(),
      }];
    });
  }, [currentConversationId, currentConversationTitle, setBookmarks]);

  const removeBookmark = useCallback((conversationId: string, messageIndex: number) => {
    setBookmarks(prev => prev.filter(
      b => !(b.conversationId === conversationId && b.messageIndex === messageIndex)
    ));
  }, [setBookmarks]);

  const bookmarkCount = useMemo(() => bookmarks.length, [bookmarks]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    bookmarkCount,
  };
}
