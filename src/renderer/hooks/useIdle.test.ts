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
});
