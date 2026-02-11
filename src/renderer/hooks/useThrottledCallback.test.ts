import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottledCallback } from './useThrottledCallback';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls immediately with leading=true (default)', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => result.current.callback());
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throttles subsequent calls within delay', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => {
      result.current.callback();
      result.current.callback();
      result.current.callback();
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls trailing function after delay', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => {
      result.current.callback('first');
      result.current.callback('second');
    });
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('does not call trailing when trailing=false', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100, trailing: false })
    );
    act(() => {
      result.current.callback();
      result.current.callback();
    });
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('defers first call when leading=false', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100, leading: false })
    );
    act(() => result.current.callback('deferred'));
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('deferred');
  });

  it('allows new call after delay passes', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => result.current.callback());
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.callback());
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel stops pending trailing call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => {
      result.current.callback();
      result.current.callback();
    });
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes correct arguments through', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => result.current.callback('a', 'b'));
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });

  it('uses latest function reference', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useThrottledCallback(fn, { delay: 100 }),
      { initialProps: { fn: fn1 } }
    );
    act(() => result.current.callback());
    expect(fn1).toHaveBeenCalledTimes(1);

    rerender({ fn: fn2 });
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.callback());
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('cleans up timer on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );
    act(() => {
      result.current.callback();
      result.current.callback();
    });
    unmount();
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('handles leading=false trailing=false as no-op', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100, leading: false, trailing: false })
    );
    act(() => result.current.callback());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).not.toHaveBeenCalled();
  });

  it('handles rapid sequential calls correctly', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, { delay: 100 })
    );

    act(() => result.current.callback(1));
    expect(fn).toHaveBeenCalledWith(1);

    act(() => vi.advanceTimersByTime(50));
    act(() => result.current.callback(2));

    act(() => vi.advanceTimersByTime(50));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);

    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.callback(3));
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith(3);
  });
});
