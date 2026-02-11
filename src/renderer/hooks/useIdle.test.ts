import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdle } from './useIdle';

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts as not idle', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));
    expect(result.current.isIdle).toBe(false);
  });

  it('becomes idle after timeout', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it('does not become idle before timeout', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(result.current.isIdle).toBe(false);
  });

  it('resets idle timer on user activity', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));

    act(() => {
      vi.advanceTimersByTime(800);
    });

    act(() => {
      document.dispatchEvent(new Event('mousemove'));
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.isIdle).toBe(false);
  });

  it('calls onIdle callback when becoming idle', () => {
    const onIdle = vi.fn();
    renderHook(() => useIdle({ timeout: 500, onIdle }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('calls onActive callback when returning from idle', () => {
    const onActive = vi.fn();
    renderHook(() => useIdle({ timeout: 500, onActive }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      document.dispatchEvent(new Event('keydown'));
    });

    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it('provides lastActiveTime', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));
    expect(typeof result.current.lastActiveTime).toBe('number');
    expect(result.current.lastActiveTime).toBeGreaterThan(0);
  });

  it('provides manual reset function', () => {
    const { result } = renderHook(() => useIdle({ timeout: 500 }));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isIdle).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isIdle).toBe(false);
  });

  it('responds to custom events', () => {
    const onIdle = vi.fn();
    renderHook(() => useIdle({ timeout: 500, events: ['click'], onIdle }));

    act(() => {
      vi.advanceTimersByTime(400);
    });

    act(() => {
      document.dispatchEvent(new Event('click'));
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const onIdle = vi.fn();
    const { unmount } = renderHook(() => useIdle({ timeout: 500, onIdle }));

    unmount();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });

  it('uses default timeout of 60000ms', () => {
    const { result } = renderHook(() => useIdle());

    act(() => {
      vi.advanceTimersByTime(59999);
    });
    expect(result.current.isIdle).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isIdle).toBe(true);
  });

  it('does not call onActive when activity occurs before idle', () => {
    const onActive = vi.fn();
    renderHook(() => useIdle({ timeout: 1000, onActive }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      document.dispatchEvent(new Event('mousemove'));
    });

    expect(onActive).not.toHaveBeenCalled();
  });

  it('updates lastActiveTime on activity event', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }));
    const initial = result.current.lastActiveTime;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      document.dispatchEvent(new Event('mousedown'));
    });

    expect(result.current.lastActiveTime).toBeGreaterThanOrEqual(initial);
  });

  it('multiple activity events keep resetting the timer', () => {
    const onIdle = vi.fn();
    renderHook(() => useIdle({ timeout: 500, onIdle }));

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(400);
      });
      act(() => {
        document.dispatchEvent(new Event('scroll'));
      });
    }

    expect(onIdle).not.toHaveBeenCalled();
  });

  it('reset after idle restarts timer correctly', () => {
    const onIdle = vi.fn();
    const { result } = renderHook(() => useIdle({ timeout: 500, onIdle }));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onIdle).toHaveBeenCalledTimes(2);
  });

  it('ignores non-registered events in custom mode', () => {
    const onIdle = vi.fn();
    renderHook(() => useIdle({ timeout: 500, events: ['click'], onIdle }));

    act(() => {
      vi.advanceTimersByTime(400);
    });

    act(() => {
      document.dispatchEvent(new Event('mousemove'));
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('return shape includes isIdle, lastActiveTime, and reset', () => {
    const { result } = renderHook(() => useIdle({ timeout: 1000 }));
    expect(result.current).toHaveProperty('isIdle');
    expect(result.current).toHaveProperty('lastActiveTime');
    expect(result.current).toHaveProperty('reset');
    expect(typeof result.current.reset).toBe('function');
  });
});
