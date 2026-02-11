import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVibration } from './useVibration';

describe('useVibration', () => {
  let originalVibrate: typeof navigator.vibrate;

  beforeEach(() => {
    vi.useFakeTimers();
    originalVibrate = navigator.vibrate;
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, 'vibrate', {
      value: originalVibrate,
      writable: true,
      configurable: true,
    });
  });

  it('detects support', () => {
    const { result } = renderHook(() => useVibration());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isVibrating).toBe(false);
  });

  it('vibrates with default duration', () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      const success = result.current.vibrate();
      expect(success).toBe(true);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(200);
    expect(result.current.isVibrating).toBe(true);
  });

  it('vibrates with custom duration', () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current.vibrate(500);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(500);
    expect(result.current.isVibrating).toBe(true);
  });

  it('vibrates with pattern', () => {
    const { result } = renderHook(() => useVibration());
    const pattern = [100, 50, 100];

    act(() => {
      result.current.vibrate(pattern);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(pattern);
    expect(result.current.isVibrating).toBe(true);
  });

  it('stops vibrating after duration', () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current.vibrate(300);
    });
    expect(result.current.isVibrating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isVibrating).toBe(false);
  });

  it('stops vibrating after pattern duration', () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current.vibrate([100, 50, 100]);
    });
    expect(result.current.isVibrating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.isVibrating).toBe(false);
  });

  it('stops vibration manually', () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current.vibrate(1000);
    });
    expect(result.current.isVibrating).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(0);
    expect(result.current.isVibrating).toBe(false);
  });

  it('returns false when vibrate fails', () => {
    (navigator.vibrate as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { result } = renderHook(() => useVibration());

    act(() => {
      const success = result.current.vibrate();
      expect(success).toBe(false);
    });

    expect(result.current.isVibrating).toBe(false);
  });

  it('returns false when unsupported', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVibration());
    expect(result.current.isSupported).toBe(false);

    act(() => {
      const success = result.current.vibrate();
      expect(success).toBe(false);
    });
  });

  it('stop works when unsupported', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVibration());
    act(() => {
      result.current.stop();
    });
    expect(result.current.isVibrating).toBe(false);
  });
});
