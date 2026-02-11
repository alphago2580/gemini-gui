import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

let onLineValue = true;

beforeEach(() => {
  onLineValue = true;
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => onLineValue,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function triggerOnline() {
  onLineValue = true;
  window.dispatchEvent(new Event('online'));
}

function triggerOffline() {
  onLineValue = false;
  window.dispatchEvent(new Event('offline'));
}

describe('useOnlineStatus', () => {
  it('returns initial online state', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.since).toBeNull();
  });

  it('returns initial offline state', () => {
    onLineValue = false;
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('detects going offline', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      triggerOffline();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('detects coming back online', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => { triggerOffline(); });
    act(() => { triggerOnline(); });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('calls onOffline callback', () => {
    const onOffline = vi.fn();
    renderHook(() => useOnlineStatus({ onOffline }));

    act(() => {
      triggerOffline();
    });

    expect(onOffline).toHaveBeenCalledTimes(1);
  });

  it('calls onOnline callback', () => {
    const onOnline = vi.fn();
    renderHook(() => useOnlineStatus({ onOnline }));

    act(() => { triggerOffline(); });
    act(() => { triggerOnline(); });

    expect(onOnline).toHaveBeenCalledTimes(1);
  });

  it('tracks since timestamp on status change', () => {
    const { result } = renderHook(() => useOnlineStatus());

    vi.setSystemTime(new Date(5000));
    act(() => {
      triggerOffline();
    });

    expect(result.current.since).toBe(5000);
  });

  it('updates since timestamp on each change', () => {
    const { result } = renderHook(() => useOnlineStatus());

    vi.setSystemTime(new Date(1000));
    act(() => { triggerOffline(); });
    expect(result.current.since).toBe(1000);

    vi.setSystemTime(new Date(5000));
    act(() => { triggerOnline(); });
    expect(result.current.since).toBe(5000);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('handles multiple offline/online cycles', () => {
    const onOnline = vi.fn();
    const onOffline = vi.fn();
    renderHook(() => useOnlineStatus({ onOnline, onOffline }));

    act(() => { triggerOffline(); });
    act(() => { triggerOnline(); });
    act(() => { triggerOffline(); });
    act(() => { triggerOnline(); });

    expect(onOffline).toHaveBeenCalledTimes(2);
    expect(onOnline).toHaveBeenCalledTimes(2);
  });

  it('works without options', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => { triggerOffline(); });
    expect(result.current.isOffline).toBe(true);
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toHaveProperty('isOnline');
    expect(result.current).toHaveProperty('isOffline');
    expect(result.current).toHaveProperty('since');
  });

  it('isOnline and isOffline are mutually exclusive', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).not.toBe(result.current.isOffline);

    act(() => { triggerOffline(); });

    expect(result.current.isOnline).not.toBe(result.current.isOffline);
  });

  it('uses latest callback references', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ onOffline }) => useOnlineStatus({ onOffline }),
      { initialProps: { onOffline: cb1 } }
    );

    rerender({ onOffline: cb2 });

    act(() => { triggerOffline(); });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('since is null before any change', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.since).toBeNull();
  });
});
