import { renderHook, act } from '@testing-library/react';
import { useRetry } from './useRetry';

describe('useRetry', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useRetry());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('executes successfully on first attempt', async () => {
    const { result } = renderHook(() => useRetry<string>());

    await act(async () => {
      const res = await result.current.execute(() => Promise.resolve('success'));
      expect(res).toBe('success');
    });

    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toBe(0);
  });

  it('retries on failure and succeeds with minimal delay', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      if (callCount < 3) return Promise.reject(new Error('fail'));
      return Promise.resolve('ok');
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 3, delay: 1, backoff: 'fixed' })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    expect(result.current.data).toBe('ok');
    expect(result.current.error).toBeNull();
    expect(callCount).toBe(3);
  });

  it('sets error after all retries exhausted', async () => {
    const error = new Error('persistent failure');
    const fn = () => Promise.reject(error);

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 2, delay: 1, backoff: 'fixed' })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toBe(2);
  });

  it('calls onRetry callback on each retry', async () => {
    const onRetry = vi.fn();
    const error = new Error('fail');
    let callCount = 0;
    const fn = () => {
      callCount++;
      if (callCount < 3) return Promise.reject(error);
      return Promise.resolve('done');
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 3, delay: 1, backoff: 'fixed', onRetry })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, error);
    expect(onRetry).toHaveBeenCalledWith(2, error);
  });

  it('reset clears state', async () => {
    const { result } = renderHook(() => useRetry<string>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve('data'));
    });

    expect(result.current.data).toBe('data');

    act(() => result.current.reset());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toBe(0);
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useRetry());
    const firstExecute = result.current.execute;
    const firstReset = result.current.reset;
    const firstCancel = result.current.cancel;
    rerender();
    expect(result.current.execute).toBe(firstExecute);
    expect(result.current.reset).toBe(firstReset);
    expect(result.current.cancel).toBe(firstCancel);
  });

  it('returns null from execute when all retries fail', async () => {
    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 1, delay: 1, backoff: 'fixed' })
    );

    let returnValue: string | null = 'not-null';
    await act(async () => {
      returnValue = await result.current.execute(() => Promise.reject(new Error('fail')));
    });

    expect(returnValue).toBeNull();
  });
});
