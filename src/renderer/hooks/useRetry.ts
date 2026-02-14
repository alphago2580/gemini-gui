import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: 'fixed' | 'exponential';
  onRetry?: (attempt: number, error: unknown) => void;
}

interface UseRetryState<T> {
  data: T | null;
  error: unknown | null;
  isLoading: boolean;
  attempt: number;
  isRetrying: boolean;
}

/**
 * Retry async operations with configurable backoff strategy.
 * Provides execute, reset, and cancel operations.
 */
export function useRetry<T>(options: UseRetryOptions = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
  } = options;

  const [state, setState] = useState<UseRetryState<T>>({
    data: null,
    error: null,
    isLoading: false,
    attempt: 0,
    isRetrying: false,
  });

  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDelay = useCallback((attempt: number): number => {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt);
    }
    return delay;
  }, [delay, backoff]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }));
  }, []);

  const reset = useCallback(() => {
    cancel();
    cancelledRef.current = false;
    setState({
      data: null,
      error: null,
      isLoading: false,
      attempt: 0,
      isRetrying: false,
    });
  }, [cancel]);

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    cancelledRef.current = false;
    setState({
      data: null,
      error: null,
      isLoading: true,
      attempt: 0,
      isRetrying: false,
    });

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (cancelledRef.current) return null;

      if (attempt > 0) {
        setState(prev => ({
          ...prev,
          attempt,
          isRetrying: true,
        }));
        onRetry?.(attempt, lastError);

        await new Promise<void>(resolve => {
          timeoutRef.current = setTimeout(resolve, getDelay(attempt - 1));
        });

        if (cancelledRef.current) return null;
      }

      try {
        const result = await fn();
        if (cancelledRef.current) return null;

        setState({
          data: result,
          error: null,
          isLoading: false,
          attempt,
          isRetrying: false,
        });
        return result;
      } catch (error) {
        lastError = error;
      }
    }

    if (!cancelledRef.current) {
      setState({
        data: null,
        error: lastError,
        isLoading: false,
        attempt: maxRetries,
        isRetrying: false,
      });
    }
    return null;
  }, [maxRetries, getDelay, onRetry]);

  // Clean up any pending timeout on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
}
