import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('initializes with idle state', () => {
    const { result } = renderHook(() => useAsync<string>());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading state when executing', async () => {
    let resolveFn: (value: string) => void;
    const promise = new Promise<string>(resolve => { resolveFn = resolve; });

    const { result } = renderHook(() => useAsync<string>());

    let executePromise: Promise<string | null>;
    act(() => {
      executePromise = result.current.execute(() => promise);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveFn!('done');
      await executePromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('done');
  });

  it('handles successful async operations', async () => {
    const { result } = renderHook(() => useAsync<number>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve(42));
    });

    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('fail')));
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('fail');
    expect(result.current.isLoading).toBe(false);
  });

  it('converts non-Error rejections to Error objects', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.reject('string error'));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('string error');
  });

  it('returns result from execute', async () => {
    const { result } = renderHook(() => useAsync<number>());

    let returnValue: number | null = null;
    await act(async () => {
      returnValue = await result.current.execute(() => Promise.resolve(99));
    });

    expect(returnValue).toBe(99);
  });

  it('returns null on error from execute', async () => {
    const { result } = renderHook(() => useAsync<number>());

    let returnValue: number | null = 123;
    await act(async () => {
      returnValue = await result.current.execute(() => Promise.reject(new Error('oops')));
    });

    expect(returnValue).toBeNull();
  });

  it('resets state to initial', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve('data'));
    });

    expect(result.current.data).toBe('data');

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears previous data on new execute', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve('first'));
    });
    expect(result.current.data).toBe('first');

    await act(async () => {
      await result.current.execute(() => Promise.resolve('second'));
    });
    expect(result.current.data).toBe('second');
  });

  it('clears previous error on new execute', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('fail')));
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'));
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('ok');
  });

  it('provides stable execute and reset references', () => {
    const { result, rerender } = renderHook(() => useAsync<string>());

    const firstExecute = result.current.execute;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.execute).toBe(firstExecute);
    expect(result.current.reset).toBe(firstReset);
  });

  it('does not update state after unmount on success', async () => {
    let resolveFn: (value: string) => void;
    const promise = new Promise<string>(resolve => { resolveFn = resolve; });

    const { result, unmount } = renderHook(() => useAsync<string>());

    act(() => {
      result.current.execute(() => promise);
    });

    expect(result.current.isLoading).toBe(true);
    unmount();

    // Resolve after unmount — should not crash or update state
    await act(async () => {
      resolveFn!('late result');
    });

    // State stays as loading since unmounted
    expect(result.current.isLoading).toBe(true);
  });

  it('does not update state after unmount on error', async () => {
    let rejectFn: (err: Error) => void;
    const promise = new Promise<string>((_, reject) => { rejectFn = reject; });

    const { result, unmount } = renderHook(() => useAsync<string>());

    act(() => {
      result.current.execute(() => promise);
    });

    unmount();

    await act(async () => {
      rejectFn!(new Error('late error'));
    });

    // Error should not be set since unmounted
    expect(result.current.error).toBeNull();
  });

  it('handles numeric rejection converted to Error', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.reject(404));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('404');
  });

  it('resets error state with reset after error', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('err')));
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('clears loading state on reset during loading', async () => {
    let resolveFn: (value: string) => void;
    const promise = new Promise<string>(resolve => { resolveFn = resolve; });

    const { result } = renderHook(() => useAsync<string>());

    act(() => {
      result.current.execute(() => promise);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isLoading).toBe(false);

    // Resolve the pending promise to avoid unhandled rejection
    await act(async () => {
      resolveFn!('done');
    });
  });

  it('handles object data type', async () => {
    const { result } = renderHook(() => useAsync<{ id: number; name: string }>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve({ id: 1, name: 'test' }));
    });

    expect(result.current.data).toEqual({ id: 1, name: 'test' });
  });

  it('handles array data type', async () => {
    const { result } = renderHook(() => useAsync<number[]>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve([1, 2, 3]));
    });

    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('sequential executes replace previous data', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      await result.current.execute(() => Promise.resolve('first'));
    });
    expect(result.current.data).toBe('first');

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('second failed')));
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe('second failed');

    await act(async () => {
      await result.current.execute(() => Promise.resolve('third'));
    });
    expect(result.current.data).toBe('third');
    expect(result.current.error).toBeNull();
  });
});
