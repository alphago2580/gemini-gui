import { useState, useCallback } from 'react';

export interface ClipboardHistoryEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface UseClipboardHistoryOptions {
  maxItems?: number;
}

export interface UseClipboardHistoryReturn {
  history: ClipboardHistoryEntry[];
  add: (text: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  copyFromHistory: (id: string) => Promise<boolean>;
  latest: ClipboardHistoryEntry | null;
}

let idCounter = 0;
function generateId(): string {
  return `clip_${Date.now()}_${++idCounter}`;
}

export function useClipboardHistory(
  options: UseClipboardHistoryOptions = {}
): UseClipboardHistoryReturn {
  const { maxItems = 50 } = options;
  const [history, setHistory] = useState<ClipboardHistoryEntry[]>([]);

  const add = useCallback((text: string) => {
    if (!text.trim()) return;

    const entry: ClipboardHistoryEntry = {
      id: generateId(),
      text,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const filtered = prev.filter(e => e.text !== text);
      const updated = [entry, ...filtered];
      return updated.slice(0, maxItems);
    });
  }, [maxItems]);

  const remove = useCallback((id: string) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  const copyFromHistory = useCallback(async (id: string): Promise<boolean> => {
    const entry = history.find(e => e.id === id);
    if (!entry) return false;

    try {
      await navigator.clipboard.writeText(entry.text);
      return true;
    } catch {
      return false;
    }
  }, [history]);

  const latest = history.length > 0 ? history[0] : null;

  return { history, add, remove, clear, copyFromHistory, latest };
}
