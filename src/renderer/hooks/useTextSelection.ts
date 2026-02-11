import { useEffect, useState, useCallback } from 'react';

export interface TextSelectionState {
  text: string;
  isCollapsed: boolean;
  anchorNode: Node | null;
  focusNode: Node | null;
  rangeCount: number;
  rect: DOMRect | null;
}

const DEFAULT_STATE: TextSelectionState = {
  text: '',
  isCollapsed: true,
  anchorNode: null,
  focusNode: null,
  rangeCount: 0,
  rect: null,
};

export function useTextSelection(): {
  selection: TextSelectionState;
  clearSelection: () => void;
  hasSelection: boolean;
} {
  const [selection, setSelection] = useState<TextSelectionState>(DEFAULT_STATE);

  const updateSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel) {
      setSelection(DEFAULT_STATE);
      return;
    }

    const text = sel.toString();
    const isCollapsed = sel.isCollapsed;
    const rangeCount = sel.rangeCount;
    let rect: DOMRect | null = null;

    if (rangeCount > 0 && !isCollapsed) {
      const range = sel.getRangeAt(0);
      rect = range.getBoundingClientRect();
    }

    setSelection({
      text,
      isCollapsed,
      anchorNode: sel.anchorNode,
      focusNode: sel.focusNode,
      rangeCount,
      rect,
    });
  }, []);

  const clearSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
    setSelection(DEFAULT_STATE);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateSelection);
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
    };
  }, [updateSelection]);

  return {
    selection,
    clearSelection,
    hasSelection: selection.text.length > 0,
  };
}
