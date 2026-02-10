import { useEffect, useRef, useCallback } from 'react';

export interface KeyCombo {
  keys: string[];
  action: () => void;
  /** Maximum time (ms) between key presses in a combo. Default: 500 */
  timeout?: number;
}

/**
 * useKeyCombo - Detects sequential key press combinations (chords).
 * Example: pressing 'g' then 'i' within 500ms triggers an action.
 * Modifier keys (ctrl, shift, alt, meta) are tracked per-keystroke.
 */
export function useKeyCombo(combos: KeyCombo[], enabled = true): void {
  const sequenceRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeKey = useCallback((e: KeyboardEvent): string => {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('mod');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    const key = e.key.toLowerCase();
    if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
      parts.push(key);
    }
    return parts.join('+');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const normalized = normalizeKey(e);
      if (!normalized) return;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      sequenceRef.current.push(normalized);

      for (const combo of combos) {
        const seq = sequenceRef.current;
        const comboKeys = combo.keys.map(k => k.toLowerCase());
        const len = comboKeys.length;

        if (seq.length >= len) {
          const tail = seq.slice(seq.length - len);
          if (tail.every((k, i) => k === comboKeys[i])) {
            combo.action();
            sequenceRef.current = [];
            return;
          }
        }
      }

      const maxLen = Math.max(...combos.map(c => c.keys.length));
      if (sequenceRef.current.length > maxLen) {
        sequenceRef.current = sequenceRef.current.slice(-maxLen);
      }

      const timeout = combos[0]?.timeout ?? 500;
      timerRef.current = setTimeout(() => {
        sequenceRef.current = [];
        timerRef.current = null;
      }, timeout);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [combos, enabled, normalizeKey]);
}
