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

  it('exponential backoff doubles delay per attempt', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    let callCount = 0;
    const fn = () => {
      callCount++;
      if (callCount < 4) return Promise.reject(new Error('fail'));
      return Promise.resolve('done');
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 3, delay: 100, backoff: 'exponential' })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    // Exponential: attempt 1 → delay*2^0=100, attempt 2 → delay*2^1=200, attempt 3 → delay*2^2=400
    const timeoutCalls = setTimeoutSpy.mock.calls.map(c => c[1]);
    expect(timeoutCalls).toContain(100);
    expect(timeoutCalls).toContain(200);
    setTimeoutSpy.mockRestore();
  });

  it('fixed backoff uses same delay for all attempts', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    let callCount = 0;
    const fn = () => {
      callCount++;
      if (callCount < 3) return Promise.reject(new Error('fail'));
      return Promise.resolve('done');
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 3, delay: 50, backoff: 'fixed' })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    const timeoutCalls = setTimeoutSpy.mock.calls.map(c => c[1]);
    const delayCalls = timeoutCalls.filter(d => d === 50);
    expect(delayCalls.length).toBeGreaterThanOrEqual(2);
    setTimeoutSpy.mockRestore();
  });

  it('cancel stops in-progress retries and returns null', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.reject(new Error('always fail'));
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 10, delay: 1, backoff: 'fixed' })
    );

    let returnValue: string | null = 'initial';
    const promise = act(async () => {
      returnValue = await result.current.execute(fn);
    });

    // Cancel immediately
    act(() => result.current.cancel());
    await promise;

    expect(returnValue).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it('maxRetries of 0 means only one attempt', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.reject(new Error('fail'));
    };

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 0, delay: 1, backoff: 'fixed' })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    expect(callCount).toBe(1);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.attempt).toBe(0);
  });

  it('execute resets state before starting', async () => {
    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 0, delay: 1, backoff: 'fixed' })
    );

    // First run: fail
    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('fail')));
    });
    expect(result.current.error).not.toBeNull();

    // Second run: succeed
    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'));
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('ok');
  });

  it('onRetry receives the last error on each retry', async () => {
    const errors = [new Error('err1'), new Error('err2'), new Error('err3')];
    let callCount = 0;
    const fn = () => {
      const err = errors[callCount] || errors[errors.length - 1];
      callCount++;
      return Promise.reject(err);
    };
    const onRetry = vi.fn();

    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 2, delay: 1, backoff: 'fixed', onRetry })
    );

    await act(async () => {
      await result.current.execute(fn);
    });

    expect(onRetry).toHaveBeenCalledWith(1, errors[0]);
    expect(onRetry).toHaveBeenCalledWith(2, errors[1]);
  });

  it('sets attempt to maxRetries after all fail', async () => {
    const { result } = renderHook(() =>
      useRetry<string>({ maxRetries: 5, delay: 1, backoff: 'fixed' })
    );

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('fail')));
    });

    expect(result.current.attempt).toBe(5);
  });
});
