import { useCallback, useRef } from 'react';

export interface UseAbortControllerReturn {
  getSignal: () => AbortSignal;
  abort: (reason?: string) => void;
  isAborted: () => boolean;
  reset: () => AbortSignal;
}

export function useAbortController(): UseAbortControllerReturn {
  const controllerRef = useRef<AbortController>(new AbortController());

  const getSignal = useCallback(() => {
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback((reason?: string) => {
    controllerRef.current.abort(reason);
  }, []);

  const isAborted = useCallback(() => {
    return controllerRef.current.signal.aborted;
  }, []);

  const reset = useCallback(() => {
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  return { getSignal, abort, isAborted, reset };
}
