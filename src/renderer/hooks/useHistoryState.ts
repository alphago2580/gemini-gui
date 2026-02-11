import { useState, useCallback, useEffect } from 'react';

export interface UseHistoryStateResult<T> {
  state: T;
  push: (newState: T, title?: string, url?: string) => void;
  replace: (newState: T, title?: string, url?: string) => void;
}

/**
 * Hook that manages state synchronized with browser History API.
 * Supports pushState, replaceState, and responds to popstate events.
 */
export function useHistoryState<T>(
  key: string,
  initialState: T
): UseHistoryStateResult<T> {
  const [state, setState] = useState<T>(() => {
    const historyState = window.history.state;
    if (historyState && typeof historyState === 'object' && key in historyState) {
      return historyState[key] as T;
    }
    return initialState;
  });

  const push = useCallback(
    (newState: T, title = '', url?: string) => {
      const currentHistory = window.history.state || {};
      const updatedState = { ...currentHistory, [key]: newState };
      window.history.pushState(updatedState, title, url);
      setState(newState);
    },
    [key]
  );

  const replace = useCallback(
    (newState: T, title = '', url?: string) => {
      const currentHistory = window.history.state || {};
      const updatedState = { ...currentHistory, [key]: newState };
      window.history.replaceState(updatedState, title, url);
      setState(newState);
    },
    [key]
  );

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state === 'object' && key in event.state) {
        setState(event.state[key] as T);
      } else {
        setState(initialState);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [key, initialState]);

  return { state, push, replace };
}
