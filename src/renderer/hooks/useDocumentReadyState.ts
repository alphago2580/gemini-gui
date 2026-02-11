import { useState, useEffect } from 'react';

export type ReadyState = DocumentReadyState;

export interface UseDocumentReadyStateReturn {
  readyState: ReadyState;
  isLoading: boolean;
  isInteractive: boolean;
  isComplete: boolean;
}

export function useDocumentReadyState(): UseDocumentReadyStateReturn {
  const [readyState, setReadyState] = useState<ReadyState>(
    typeof document !== 'undefined' ? document.readyState : 'loading'
  );

  useEffect(() => {
    const handler = () => {
      setReadyState(document.readyState);
    };

    document.addEventListener('readystatechange', handler);
    return () => document.removeEventListener('readystatechange', handler);
  }, []);

  return {
    readyState,
    isLoading: readyState === 'loading',
    isInteractive: readyState === 'interactive' || readyState === 'complete',
    isComplete: readyState === 'complete',
  };
}
