import { useState, useEffect, useCallback, useRef } from 'react';

export interface ClipboardContent {
  /** Text content from clipboard */
  text: string | null;
  /** Whether clipboard has content */
  hasContent: boolean;
  /** Timestamp of last read */
  lastRead: number;
}

export interface UseClipboardMonitorOptions {
  /** Polling interval in ms (for browsers without Clipboard API events) */
  pollInterval?: number;
  /** Whether to start monitoring */
  enabled?: boolean;
  /** Called when clipboard content changes */
  onChange?: (content: ClipboardContent) => void;
}

export interface UseClipboardMonitorResult {
  /** Current clipboard content */
  content: ClipboardContent;
  /** Read clipboard content manually */
  read: () => Promise<void>;
  /** Whether Clipboard API is supported */
  isSupported: boolean;
  /** Error from last read attempt */
  error: Error | null;
}

export function useClipboardMonitor(options: UseClipboardMonitorOptions = {}): UseClipboardMonitorResult {
  const { pollInterval = 0, enabled = true, onChange } = options;

  const [content, setContent] = useState<ClipboardContent>({
    text: null,
    hasContent: false,
    lastRead: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastTextRef = useRef<string | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    typeof navigator.clipboard.readText === 'function';

  const read = useCallback(async () => {
    if (!isSupported) {
      setError(new Error('Clipboard API is not supported'));
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      const newContent: ClipboardContent = {
        text: text || null,
        hasContent: !!text,
        lastRead: Date.now(),
      };

      if (text !== lastTextRef.current) {
        lastTextRef.current = text;
        setContent(newContent);
        onChangeRef.current?.(newContent);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [isSupported]);

  // Polling for clipboard changes
  useEffect(() => {
    if (!enabled || !isSupported || pollInterval <= 0) return;

    const intervalId = setInterval(() => {
      read();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [enabled, isSupported, pollInterval, read]);

  // Listen for focus events (common approach to detect clipboard changes)
  useEffect(() => {
    if (!enabled || !isSupported) return;

    const handleFocus = () => {
      read();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, isSupported, read]);

  return { content, read, isSupported, error };
}
