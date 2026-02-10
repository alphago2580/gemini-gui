import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY_REACTIONS = 'gemini-emoji-reactions';

export interface EmojiReaction {
  emoji: string;
  count: number;
}

export interface MessageReactions {
  [messageKey: string]: EmojiReaction[];
}

function makeKey(conversationId: string, messageIndex: number): string {
  return `${conversationId}:${messageIndex}`;
}

export function useEmojiReactions() {
  const [reactions, setReactions] = useLocalStorage<MessageReactions>(STORAGE_KEY_REACTIONS, {});

  const addReaction = useCallback((conversationId: string, messageIndex: number, emoji: string) => {
    const key = makeKey(conversationId, messageIndex);
    setReactions(prev => {
      const existing = prev[key] || [];
      const found = existing.find(r => r.emoji === emoji);
      if (found) {
        return {
          ...prev,
          [key]: existing.map(r =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          ),
        };
      }
      return {
        ...prev,
        [key]: [...existing, { emoji, count: 1 }],
      };
    });
  }, [setReactions]);

  const removeReaction = useCallback((conversationId: string, messageIndex: number, emoji: string) => {
    const key = makeKey(conversationId, messageIndex);
    setReactions(prev => {
      const existing = prev[key];
      if (!existing) return prev;
      const updated = existing
        .map(r => r.emoji === emoji ? { ...r, count: r.count - 1 } : r)
        .filter(r => r.count > 0);
      if (updated.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: updated };
    });
  }, [setReactions]);

  const toggleReaction = useCallback((conversationId: string, messageIndex: number, emoji: string) => {
    const key = makeKey(conversationId, messageIndex);
    setReactions(prev => {
      const existing = prev[key] || [];
      const found = existing.find(r => r.emoji === emoji);
      if (found) {
        const updated = existing.filter(r => r.emoji !== emoji);
        if (updated.length === 0) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: updated };
      }
      return {
        ...prev,
        [key]: [...existing, { emoji, count: 1 }],
      };
    });
  }, [setReactions]);

  const getReactions = useCallback((conversationId: string, messageIndex: number): EmojiReaction[] => {
    const key = makeKey(conversationId, messageIndex);
    return reactions[key] || [];
  }, [reactions]);

  const clearReactions = useCallback((conversationId: string, messageIndex: number) => {
    const key = makeKey(conversationId, messageIndex);
    setReactions(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, [setReactions]);

  const clearAllReactions = useCallback(() => {
    setReactions({});
  }, [setReactions]);

  return {
    reactions,
    addReaction,
    removeReaction,
    toggleReaction,
    getReactions,
    clearReactions,
    clearAllReactions,
  };
}
