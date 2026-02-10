import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with zero seconds and not running', () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('starts countdown from given seconds', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(5));
    expect(result.current.secondsLeft).toBe(5);
    expect(result.current.isRunning).toBe(true);
  });

  it('decrements each second', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(3));

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(2);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(1);
  });

  it('stops at zero and sets isRunning to false', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(2));

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('calls onComplete when reaching zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCountdown(onComplete));
    act(() => result.current.start(1));

    act(() => { vi.advanceTimersByTime(1000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pause stops counting', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(5));

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.secondsLeft).toBe(3);

    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(3);
  });

  it('resume continues from paused state', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(5));

    act(() => { vi.advanceTimersByTime(2000); });
    act(() => result.current.pause());

    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(true);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(0);
  });

  it('reset clears everything', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(10));
    act(() => { vi.advanceTimersByTime(3000); });

    act(() => result.current.reset());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(0);
  });

  it('resume does nothing when secondsLeft is 0', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(false);
  });

  it('cleans up on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { result, unmount } = renderHook(() => useCountdown());
    act(() => result.current.start(10));
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
