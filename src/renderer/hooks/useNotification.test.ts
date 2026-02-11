import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useNotification';

describe('useNotification', () => {
  const originalNotification = globalThis.Notification;

  beforeEach(() => {
    // Mock Notification API
    const MockNotification = vi.fn() as unknown as typeof Notification;
    Object.defineProperty(MockNotification, 'permission', {
      value: 'default',
      writable: true,
      configurable: true,
    });
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
    globalThis.Notification = MockNotification;
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
  });

  it('detects notification support', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.isSupported).toBe(true);
  });

  it('returns current permission state', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.permission).toBe('default');
  });

  it('returns denied permission when not supported', () => {
    // Remove Notification from window
    const saved = globalThis.Notification;
    // @ts-expect-error intentionally removing for test
    delete globalThis.Notification;

    const { result } = renderHook(() => useNotification());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.permission).toBe('denied');

    globalThis.Notification = saved;
  });

  it('requests permission and updates state', async () => {
    const { result } = renderHook(() => useNotification());

    let permission: string = '';
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(permission).toBe('granted');
    expect(result.current.permission).toBe('granted');
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it('returns denied from requestPermission when not supported', async () => {
    const saved = globalThis.Notification;
    // @ts-expect-error intentionally removing for test
    delete globalThis.Notification;

    const { result } = renderHook(() => useNotification());

    let permission: string = '';
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(permission).toBe('denied');

    globalThis.Notification = saved;
  });

  it('creates notification when permission is granted', () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.notify('Test Title', { body: 'Test body' });
    });

    expect(Notification).toHaveBeenCalledWith('Test Title', { body: 'Test body' });
  });

  it('returns null when permission is not granted', () => {
    // permission is 'default'
    const { result } = renderHook(() => useNotification());

    let notification: Notification | null = null;
    act(() => {
      notification = result.current.notify('Test', {});
    });

    expect(notification).toBeNull();
  });

  it('returns null when notification constructor throws', () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });
    (Notification as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Not allowed');
    });

    const { result } = renderHook(() => useNotification());

    let notification: Notification | null = null;
    act(() => {
      notification = result.current.notify('Test', {});
    });

    expect(notification).toBeNull();
  });

  it('requestPermission handles rejection gracefully', async () => {
    (Notification.requestPermission as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Denied'));

    const { result } = renderHook(() => useNotification());

    let permission: string = '';
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(permission).toBe('denied');
  });

  it('provides stable function references', () => {
    const { result, rerender } = renderHook(() => useNotification());
    const first = result.current;
    rerender();
    expect(result.current.requestPermission).toBe(first.requestPermission);
  });

  it('returns all four fields in result shape', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current).toHaveProperty('permission');
    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('requestPermission');
    expect(result.current).toHaveProperty('notify');
  });

  it('notify returns null when not supported', () => {
    const saved = globalThis.Notification;
    // @ts-expect-error intentionally removing for test
    delete globalThis.Notification;

    const { result } = renderHook(() => useNotification());

    let notification: Notification | null = null;
    act(() => {
      notification = result.current.notify('Test', {});
    });

    expect(notification).toBeNull();
    globalThis.Notification = saved;
  });

  it('notify passes options to Notification constructor', () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.notify('Title', { body: 'Body', icon: '/icon.png' });
    });

    expect(Notification).toHaveBeenCalledWith('Title', { body: 'Body', icon: '/icon.png' });
  });

  it('notify with no options passes undefined', () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.notify('Title');
    });

    expect(Notification).toHaveBeenCalledWith('Title', undefined);
  });

  it('requestPermission updates permission to denied', async () => {
    (Notification.requestPermission as ReturnType<typeof vi.fn>).mockResolvedValue('denied');

    const { result } = renderHook(() => useNotification());

    let permission: string = '';
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(permission).toBe('denied');
    expect(result.current.permission).toBe('denied');
  });

  it('notify stable reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useNotification());
    const firstNotify = result.current.notify;
    rerender();
    expect(result.current.notify).toBe(firstNotify);
  });

  it('permission reflects initial Notification.permission', () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });

    const { result } = renderHook(() => useNotification());
    expect(result.current.permission).toBe('granted');
  });

  it('isSupported is true when Notification exists in window', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.isSupported).toBe(true);
  });
});
