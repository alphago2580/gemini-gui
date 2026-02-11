import { useState, useCallback, useRef } from 'react';

export interface UseCopyToClipboardOptions {
  /** Duration in ms to show "copied" state (default: 2000) */
  resetDelay?: number;
  /** Callback on successful copy */
  onSuccess?: (text: string) => void;
  /** Callback on copy failure */
  onError?: (error: Error) => void;
}

export interface UseCopyToClipboardResult {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Whether a recent copy succeeded (resets after resetDelay) */
  isCopied: boolean;
  /** The last successfully copied text */
  copiedText: string | null;
  /** Whether a copy operation is in progress */
  isLoading: boolean;
  /** Last copy error, if any */
  error: Error | null;
  /** Reset state manually */
  reset: () => void;
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardResult {
  const { resetDelay = 2000, onSuccess, onError } = options;

  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const reset = useCallback(() => {
    setIsCopied(false);
    setCopiedText(null);
    setError(null);
    setIsLoading(false);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setCopiedText(text);
        setIsLoading(false);
        onSuccessRef.current?.(text);

        if (resetDelay > 0) {
          timerRef.current = setTimeout(() => {
            setIsCopied(false);
            timerRef.current = null;
          }, resetDelay);
        }

        return true;
      } catch (err) {
        const copyError = err instanceof Error ? err : new Error(String(err));
        setError(copyError);
        setIsCopied(false);
        setIsLoading(false);
        onErrorRef.current?.(copyError);
        return false;
      }
    },
    [resetDelay]
  );

  return { copy, isCopied, copiedText, isLoading, error, reset };
}
