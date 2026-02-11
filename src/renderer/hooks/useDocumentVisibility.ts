import { useState, useEffect, useCallback, useRef } from 'react';

export type DocumentVisibilityState = 'visible' | 'hidden' | 'prerender';

export interface UseDocumentVisibilityOptions {
  onChange?: (state: DocumentVisibilityState) => void;
}

export interface UseDocumentVisibilityReturn {
  visibilityState: DocumentVisibilityState;
  isVisible: boolean;
  isHidden: boolean;
  changeCount: number;
}

export function useDocumentVisibility(
  options: UseDocumentVisibilityOptions = {}
): UseDocumentVisibilityReturn {
  const { onChange } = options;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(
    () => (document.visibilityState as DocumentVisibilityState) ?? 'visible'
  );
  const [changeCount, setChangeCount] = useState(0);

  const handleVisibilityChange = useCallback(() => {
    const state = document.visibilityState as DocumentVisibilityState;
    setVisibilityState(state);
    setChangeCount(c => c + 1);
    onChangeRef.current?.(state);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    visibilityState,
    isVisible: visibilityState === 'visible',
    isHidden: visibilityState === 'hidden',
    changeCount,
  };
}
