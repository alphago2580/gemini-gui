import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEY_REACTIONS } from '../constants/strings';

export interface ReactionMap {
  [emoji: string]: number;
}

export interface ReactionsStore {
  [key: string]: ReactionMap;
}

function makeKey(conversationId: string, messageIndex: number): string {
  return `${conversationId}:${messageIndex}`;
}

export interface UseReactionsReturn {
  reactions: ReactionsStore;
  toggleReaction: (conversationId: string, messageIndex: number, emoji: string) => void;
  getReactions: (conversationId: string, messageIndex: number) => ReactionMap;
  hasReaction: (conversationId: string, messageIndex: number, emoji: string) => boolean;
}

export function useReactions(): UseReactionsReturn {
  const [reactions, setReactions] = useLocalStorage<ReactionsStore>(STORAGE_KEY_REACTIONS, {});

  const toggleReaction = useCallback((conversationId: string, messageIndex: number, emoji: string) => {
    setReactions(prev => {
      const key = makeKey(conversationId, messageIndex);
      const current = prev[key] || {};
      const count = current[emoji] || 0;
      const updated = { ...current };

      if (count > 0) {
        delete updated[emoji];
      } else {
        updated[emoji] = 1;
      }

      const next = { ...prev };
      if (Object.keys(updated).length === 0) {
        delete next[key];
      } else {
        next[key] = updated;
      }
      return next;
    });
  }, [setReactions]);

  const getReactions = useCallback((conversationId: string, messageIndex: number): ReactionMap => {
    const key = makeKey(conversationId, messageIndex);
    return reactions[key] || {};
  }, [reactions]);

  const hasReaction = useCallback((conversationId: string, messageIndex: number, emoji: string): boolean => {
    const key = makeKey(conversationId, messageIndex);
    return (reactions[key]?.[emoji] || 0) > 0;
  }, [reactions]);

  return { reactions, toggleReaction, getReactions, hasReaction };
}
