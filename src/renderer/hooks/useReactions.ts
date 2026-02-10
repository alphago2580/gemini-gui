import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY_REACTIONS = 'gemini-reactions';

type ReactionMap = Record<string, string[]>;

function makeKey(conversationId: string, messageIndex: number): string {
  return `${conversationId}:${messageIndex}`;
}

export function useReactions(currentConversationId: string | null) {
  const [reactions, setReactions] = useLocalStorage<ReactionMap>(STORAGE_KEY_REACTIONS, {});

  const getReactions = useCallback((messageIndex: number): string[] => {
    if (!currentConversationId) return [];
    return reactions[makeKey(currentConversationId, messageIndex)] || [];
  }, [reactions, currentConversationId]);

  const addReaction = useCallback((messageIndex: number, emoji: string) => {
    if (!currentConversationId) return;
    const key = makeKey(currentConversationId, messageIndex);
    setReactions(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), emoji],
    }));
  }, [currentConversationId, setReactions]);

  return {
    getReactions,
    addReaction,
  };
}
