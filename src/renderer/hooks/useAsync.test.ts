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
});
