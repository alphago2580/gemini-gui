import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 1000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('throttles updates after initial render sets lastUpdated', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );
    expect(result.current).toBe('a');

    // Initial effect already set lastUpdated=1000, so next update within window is throttled
    rerender({ value: 'b', delay: 300 });
    expect(result.current).toBe('a');

    // After delay elapses, throttled value updates
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('b');
  });

  it('allows update after throttle window elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 'first' } }
    );

    // Wait for throttle window to expire from initial render
    act(() => { vi.advanceTimersByTime(100); });

    // Now update should go through immediately
    rerender({ value: 'second' });
    expect(result.current).toBe('second');

    // Wait again
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'third' });
    expect(result.current).toBe('third');
  });

  it('uses latest value when timer fires after multiple rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 1 } }
    );
    expect(result.current).toBe(1);

    // All rapid updates within window are delayed
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });
    rerender({ value: 5 });

    expect(result.current).toBe(1);

    // Only the last pending timer fires with most recent value
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe(5);
  });

  it('works with zero delay (all updates go through)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 0),
      { initialProps: { value: 'x' } }
    );
    expect(result.current).toBe('x');

    rerender({ value: 'y' });
    expect(result.current).toBe('y');

    rerender({ value: 'z' });
    expect(result.current).toBe('z');
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { rerender, unmount } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    rerender({ value: 'c' });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('works with object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 200),
      { initialProps: { value: { x: 1 } } }
    );
    expect(result.current).toEqual({ x: 1 });

    // Update within window — delayed
    rerender({ value: { x: 2 } });
    expect(result.current).toEqual({ x: 1 });

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toEqual({ x: 2 });
  });

  it('handles delay change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    // Update within window — delayed
    rerender({ value: 'b', delay: 500 });
    expect(result.current).toBe('a');

    // Change to shorter delay with new value — resets timer
    rerender({ value: 'c', delay: 100 });
    expect(result.current).toBe('a');

    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('c');
  });

  it('cancels previous timeout when new update arrives', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    // Advance partway, then update again
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'c' });
    expect(result.current).toBe('a');

    // Original timer at 300ms wouldn't fire 'b' — it was cancelled
    // New timer fires remaining time
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('c');
  });

  it('handles null value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 200),
      { initialProps: { value: null as string | null } }
    );
    expect(result.current).toBeNull();

    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: 'hello' });
    expect(result.current).toBe('hello');
  });

  it('handles undefined value', () => {
    const { result } = renderHook(() => useThrottle(undefined, 100));
    expect(result.current).toBeUndefined();
  });

  it('handles boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 200),
      { initialProps: { value: false } }
    );
    expect(result.current).toBe(false);

    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: true });
    expect(result.current).toBe(true);
  });

  it('handles array values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 200),
      { initialProps: { value: [1, 2, 3] } }
    );
    expect(result.current).toEqual([1, 2, 3]);

    rerender({ value: [4, 5] });
    expect(result.current).toEqual([1, 2, 3]);

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toEqual([4, 5]);
  });

  it('does not fire timer after unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useThrottle(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    unmount();

    // Timer fires but no crash
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('a');
  });

  it('immediate update after full delay cycle', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 'x' } }
    );

    // Wait full cycle
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'y' });
    // Should update immediately since elapsed >= delay
    expect(result.current).toBe('y');

    // Wait full cycle again
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'z' });
    expect(result.current).toBe('z');
  });

  it('handles very large delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 999999),
      { initialProps: { value: 'start' } }
    );

    rerender({ value: 'middle' });
    expect(result.current).toBe('start');

    act(() => { vi.advanceTimersByTime(999999); });
    expect(result.current).toBe('middle');
  });
});
