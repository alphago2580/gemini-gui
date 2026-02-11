import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus', () => {
  const originalOnLine = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    });
  });

  it('initializes with current navigator.onLine value', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('initializes as offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it('starts with null timestamps', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.lastOnlineAt).toBeNull();
    expect(result.current.lastOfflineAt).toBeNull();
  });

  it('updates isOnline to false on offline event', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('updates isOnline to true on online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('sets lastOfflineAt timestamp on offline event', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.lastOfflineAt).toBeInstanceOf(Date);
  });

  it('sets lastOnlineAt timestamp on online event', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
  });

  it('preserves previous timestamps when other event fires', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    const offlineTime = result.current.lastOfflineAt;

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.lastOfflineAt).toBe(offlineTime);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
  });

  it('removes event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useNetworkStatus());

    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('does not update state after unmount', () => {
    const { result, unmount } = renderHook(() => useNetworkStatus());
    unmount();

    // Should not throw or update
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // result.current still holds last values before unmount
    expect(result.current.lastOfflineAt).toBeNull();
  });

  it('returns three fields in result shape', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toHaveProperty('isOnline');
    expect(result.current).toHaveProperty('lastOnlineAt');
    expect(result.current).toHaveProperty('lastOfflineAt');
  });

  it('offline then online updates both timestamps', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.lastOfflineAt).toBeInstanceOf(Date);
    expect(result.current.lastOnlineAt).toBeNull();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    expect(result.current.lastOfflineAt).toBeInstanceOf(Date);
  });

  it('multiple offline events update lastOfflineAt each time', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    const first = result.current.lastOfflineAt;

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    const second = result.current.lastOfflineAt;

    // Both are Date objects; second may be same or later
    expect(first).toBeInstanceOf(Date);
    expect(second).toBeInstanceOf(Date);
  });

  it('multiple online events update lastOnlineAt each time', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    const first = result.current.lastOnlineAt;

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    const second = result.current.lastOnlineAt;

    expect(first).toBeInstanceOf(Date);
    expect(second).toBeInstanceOf(Date);
  });

  it('rapid online-offline-online cycle', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    expect(result.current.lastOfflineAt).toBeInstanceOf(Date);
  });

  it('isOnline stays false after multiple offline events without online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.lastOnlineAt).toBeNull();
  });

  it('isOnline stays true after multiple online events without offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOfflineAt).toBeNull();
  });

  it('timestamps are Date instances with valid time', () => {
    const before = Date.now();
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const after = Date.now();
    const offlineTime = result.current.lastOfflineAt!.getTime();
    expect(offlineTime).toBeGreaterThanOrEqual(before);
    expect(offlineTime).toBeLessThanOrEqual(after);
  });
});
