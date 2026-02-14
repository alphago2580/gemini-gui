import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution until after delay (trailing=true default)', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('hello'));
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello');
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('a'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.callback('b'));
    act(() => vi.advanceTimersByTime(100));
    // 200ms since first call but only 100ms since second — should not fire yet
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('fires on leading edge when leading=true', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200, leading: true })
    );
    act(() => result.current.callback('first'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('with leading=true, subsequent calls within delay are debounced', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200, leading: true })
    );
    act(() => result.current.callback('first'));
    act(() => result.current.callback('second'));
    act(() => result.current.callback('third'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');

    act(() => vi.advanceTimersByTime(200));
    // trailing fires with last args
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('third');
  });

  it('with leading=true, trailing=false only fires on leading edge', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200, leading: true, trailing: false })
    );
    act(() => result.current.callback('first'));
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => result.current.callback('second'));
    act(() => vi.advanceTimersByTime(300));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel stops pending execution', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('cancelled'));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(300));
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush triggers pending execution immediately', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('flushed'));
    expect(fn).not.toHaveBeenCalled();
    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('flushed');
  });

  it('flush is a no-op when nothing is pending', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.flush());
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush does not cause double invocation after delay', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('value'));
    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(300));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('isPending reflects whether a call is pending', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    expect(result.current.isPending).toBe(false);
    act(() => result.current.callback());
    expect(result.current.isPending).toBe(true);
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.isPending).toBe(false);
  });

  it('isPending becomes false after cancel', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback());
    expect(result.current.isPending).toBe(true);
    act(() => result.current.cancel());
    expect(result.current.isPending).toBe(false);
  });

  it('maxWait guarantees execution within maxWait ms', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100, maxWait: 250 })
    );
    // Keep retriggering every 80ms — normally the 100ms debounce resets each time
    act(() => result.current.callback('a'));
    act(() => vi.advanceTimersByTime(80));
    act(() => result.current.callback('b'));
    act(() => vi.advanceTimersByTime(80));
    act(() => result.current.callback('c'));
    // 160ms elapsed, maxWait is 250, not yet
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(80));
    act(() => result.current.callback('d'));
    // 240ms elapsed still under 250
    act(() => vi.advanceTimersByTime(10));
    // 250ms — maxWait should fire
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('d');
  });

  it('passes multiple arguments correctly', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100 })
    );
    act(() => result.current.callback('x', 'y', 'z'));
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledWith('x', 'y', 'z');
  });

  it('uses the latest function reference', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useDebouncedCallback(fn, { delay: 100 }),
      { initialProps: { fn: fn1 } }
    );
    act(() => result.current.callback('test'));
    rerender({ fn: fn2 });
    act(() => vi.advanceTimersByTime(100));
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledWith('test');
  });

  it('cleans up timers on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 200 })
    );
    act(() => result.current.callback('unmounted'));
    unmount();
    act(() => vi.advanceTimersByTime(300));
    expect(fn).not.toHaveBeenCalled();
  });

  it('handles leading=false trailing=false as no-op', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100, leading: false, trailing: false })
    );
    act(() => result.current.callback());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).not.toHaveBeenCalled();
  });

  it('can be called again after delay completes', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100 })
    );
    act(() => result.current.callback('first'));
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => result.current.callback('second'));
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('handles rapid calls keeping only last args', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100 })
    );
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.callback(i);
      }
    });
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(9);
  });

  it('maxWait clears debounce timer when it fires', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(fn, { delay: 100, maxWait: 150 })
    );
    act(() => result.current.callback('a'));
    act(() => vi.advanceTimersByTime(80));
    act(() => result.current.callback('b'));
    act(() => vi.advanceTimersByTime(70));
    // 150ms total — maxWait fires
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');

    // Normal debounce timer at 180ms should NOT fire again
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
