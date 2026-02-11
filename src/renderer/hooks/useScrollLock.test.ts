import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollLock } from './useScrollLock';

describe('useScrollLock', () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = '';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
    vi.restoreAllMocks();
  });

  it('returns initial unlocked state by default', () => {
    const { result } = renderHook(() => useScrollLock());
    expect(result.current.isLocked).toBe(false);
  });

  it('returns initial locked state when specified', () => {
    const { result } = renderHook(() => useScrollLock(true));
    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('locks scroll on lock()', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.lock();
    });

    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('unlocks scroll on unlock()', () => {
    const { result } = renderHook(() => useScrollLock(true));

    act(() => {
      result.current.unlock();
    });

    expect(result.current.isLocked).toBe(false);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('toggles scroll lock', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isLocked).toBe(false);
  });

  it('restores scroll position on unlock', () => {
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });

    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.lock();
    });

    act(() => {
      result.current.unlock();
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 150);
  });

  it('restores overflow on unmount', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('lock() is stable across renders', () => {
    const { result, rerender } = renderHook(() => useScrollLock());
    const firstLock = result.current.lock;
    rerender();
    expect(result.current.lock).toBe(firstLock);
  });

  it('unlock() is stable across renders', () => {
    const { result, rerender } = renderHook(() => useScrollLock());
    const firstUnlock = result.current.unlock;
    rerender();
    expect(result.current.unlock).toBe(firstUnlock);
  });

  it('toggle() is stable across renders', () => {
    const { result, rerender } = renderHook(() => useScrollLock());
    const firstToggle = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(firstToggle);
  });

  it('return shape matches UseScrollLockResult', () => {
    const { result } = renderHook(() => useScrollLock());
    expect(result.current).toHaveProperty('isLocked');
    expect(result.current).toHaveProperty('lock');
    expect(result.current).toHaveProperty('unlock');
    expect(result.current).toHaveProperty('toggle');
    expect(typeof result.current.lock).toBe('function');
    expect(typeof result.current.unlock).toBe('function');
    expect(typeof result.current.toggle).toBe('function');
  });

  it('multiple lock calls are idempotent', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => { result.current.lock(); });
    act(() => { result.current.lock(); });

    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('multiple unlock calls are idempotent', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => { result.current.unlock(); });
    act(() => { result.current.unlock(); });

    expect(result.current.isLocked).toBe(false);
  });
});
