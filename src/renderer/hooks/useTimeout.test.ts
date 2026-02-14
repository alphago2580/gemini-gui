import { renderHook, act } from '@testing-library/react';
import { useTimeout } from './useTimeout';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback after specified delay', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback before delay elapses', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 500));

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback only once', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 100));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire when delay is null', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, null));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up timeout on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('returns isPending true while timeout is active', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isPending).toBe(false);
  });

  it('returns isPending false when delay is null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, null));

    expect(result.current.isPending).toBe(false);
  });

  it('clear cancels pending timeout', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    expect(result.current.isPending).toBe(true);

    act(() => {
      result.current.clear();
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('reset restarts the timeout', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current.reset();
    });

    // After reset, need full 1000ms again
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('reset after clear re-starts the timeout', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 500));

    act(() => {
      result.current.clear();
    });
    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('reset does nothing when delay is null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, null));

    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it('uses latest callback without restarting timer', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useTimeout(cb, 1000),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ cb: callback2 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('restarts timeout when delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ delay: 500 });

    // Old timeout should be cancelled, new one started
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('stops timeout when delay changes to null', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ delay: null });

    expect(result.current.isPending).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('starts timeout when delay changes from null to number', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: null as number | null } }
    );

    expect(result.current.isPending).toBe(false);

    rerender({ delay: 300 });

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('works with zero delay', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('clearTimeout is called on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('multiple delay changes each restart the timer', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    rerender({ delay: 2000 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('clear is idempotent (calling it multiple times is safe)', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      result.current.clear();
      result.current.clear();
      result.current.clear();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('reset after timeout has fired restarts the timeout', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 200));

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
