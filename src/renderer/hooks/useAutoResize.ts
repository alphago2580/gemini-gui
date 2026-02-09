import { useCallback, useEffect, useRef } from 'react';

const MIN_HEIGHT = 44; // ~1 row
const MAX_HEIGHT = 200; // ~8 rows

export function useAutoResize(value: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset to min height to measure scrollHeight correctly
    textarea.style.height = `${MIN_HEIGHT}px`;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return { textareaRef, resize };
}
