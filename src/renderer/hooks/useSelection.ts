import { useState, useCallback, useEffect, useRef } from 'react';

interface SelectionState {
  text: string;
  startOffset: number;
  endOffset: number;
  isCollapsed: boolean;
}

const EMPTY_SELECTION: SelectionState = {
  text: '',
  startOffset: 0,
  endOffset: 0,
  isCollapsed: true,
};

/**
 * Tracks text selection within a target element or globally.
 * Returns selected text, offsets, and collapse state.
 * Provides clear() to programmatically deselect.
 */
export function useSelection(targetRef?: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<SelectionState>(EMPTY_SELECTION);
  const isListening = useRef(true);

  const updateSelection = useCallback(() => {
    if (!isListening.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSelection(EMPTY_SELECTION);
      return;
    }

    const text = sel.toString();
    if (!text) {
      setSelection(EMPTY_SELECTION);
      return;
    }

    // If targetRef is provided, only track selections within that element
    if (targetRef?.current) {
      const range = sel.getRangeAt(0);
      if (!targetRef.current.contains(range.commonAncestorContainer)) {
        setSelection(EMPTY_SELECTION);
        return;
      }
    }

    const range = sel.getRangeAt(0);
    setSelection({
      text,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      isCollapsed: sel.isCollapsed,
    });
  }, [targetRef]);

  const clear = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(EMPTY_SELECTION);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateSelection);
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
    };
  }, [updateSelection]);

  return {
    ...selection,
    clear,
  };
}
