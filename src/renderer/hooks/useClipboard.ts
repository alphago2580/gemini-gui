import { useState, useCallback, useRef, useMemo } from 'react';

export interface UseClipboardResult {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

const DEFAULT_RESET_DELAY = 2000;

/**
 * Provides clipboard copy functionality with visual feedback.
 * `copied` resets to false after the specified delay.
 */
export function useClipboard(resetDelay: number = DEFAULT_RESET_DELAY): UseClipboardResult {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, resetDelay);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Copy failed';
      setError(message);
      setCopied(false);
      return false;
    }
  }, [resetDelay]);

  return useMemo(() => ({ copy, copied, error }), [copy, copied, error]);
}
