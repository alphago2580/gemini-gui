import { useState, useMemo, useCallback, useEffect } from 'react';

export interface InlineSearchMatch {
  messageIndex: number;
  matchIndex: number;
}

export interface InlineSearchState {
  isOpen: boolean;
  query: string;
  matches: InlineSearchMatch[];
  currentMatchIndex: number;
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  goToNext: () => void;
  goToPrev: () => void;
  currentMatch: InlineSearchMatch | null;
}

export function useInlineSearch(
  messages: Array<{ content: string }>
): InlineSearchState {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const result: InlineSearchMatch[] = [];

    for (let msgIdx = 0; msgIdx < messages.length; msgIdx++) {
      const content = messages[msgIdx].content.toLowerCase();
      let searchFrom = 0;
      let matchWithin = 0;
      while (searchFrom < content.length) {
        const pos = content.indexOf(lowerQuery, searchFrom);
        if (pos === -1) break;
        result.push({ messageIndex: msgIdx, matchIndex: matchWithin });
        matchWithin++;
        searchFrom = pos + lowerQuery.length;
      }
    }

    return result;
  }, [messages, query]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [query]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQueryState('');
    setCurrentMatchIndex(0);
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev + 1) % matches.length);
  }, [matches.length]);

  const goToPrev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const currentMatch = matches.length > 0 ? matches[currentMatchIndex] ?? null : null;

  return {
    isOpen,
    query,
    matches,
    currentMatchIndex,
    open,
    close,
    setQuery,
    goToNext,
    goToPrev,
    currentMatch,
  };
}
