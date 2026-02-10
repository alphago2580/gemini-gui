import { renderHook } from '@testing-library/react';
import { useInterval } from './useInterval';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback at specified interval', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(5);
  });

  it('does not fire when delay is null', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 500));

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);

    unmount();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('uses latest callback without resetting interval', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useInterval(cb, 1000),
      { initialProps: { cb: callback1 } }
    );

    vi.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);

    rerender({ cb: callback2 });

    vi.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('restarts interval when delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2);

    callback.mockClear();
    rerender({ delay: 500 });

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(4);
  });

  it('stops interval when delay changes to null', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 200 as number | null } }
    );

    vi.advanceTimersByTime(600);
    expect(callback).toHaveBeenCalledTimes(3);

    rerender({ delay: null });

    vi.advanceTimersByTime(600);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('resumes interval when delay changes from null to number', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: null as number | null } }
    );

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();

    rerender({ delay: 250 });

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(4);
  });

  it('works with very short intervals', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 10));

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(10);
  });
});
