import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadingProgress } from './useReadingProgress';

describe('useReadingProgress', () => {
  let scrollListeners: Array<EventListenerOrEventListenerObject>;

  beforeEach(() => {
    scrollListeners = [];
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') scrollListeners.push(handler);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

    // Default: no scroll, page fits in viewport
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 1000, writable: true, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial progress of 0', () => {
    const { result } = renderHook(() => useReadingProgress());
    expect(result.current.progress).toBe(0);
  });

  it('returns isVisible false when at top', () => {
    const { result } = renderHook(() => useReadingProgress());
    expect(result.current.isVisible).toBe(false);
  });

  it('provides a reset function', () => {
    const { result } = renderHook(() => useReadingProgress());
    expect(typeof result.current.reset).toBe('function');
  });

  it('calculates progress from window scroll', () => {
    // Setup: scrollable content
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 750, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 750, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));

    // Trigger scroll
    act(() => {
      for (const listener of scrollListeners) {
        if (typeof listener === 'function') listener(new Event('scroll'));
      }
    });

    expect(result.current.progress).toBe(50);
    expect(result.current.isVisible).toBe(true);
  });

  it('sets isVisible true when scrolled down', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 100, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));

    act(() => {
      for (const listener of scrollListeners) {
        if (typeof listener === 'function') listener(new Event('scroll'));
      }
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('returns 100% at bottom of page', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 1500, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 1500, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));

    act(() => {
      for (const listener of scrollListeners) {
        if (typeof listener === 'function') listener(new Event('scroll'));
      }
    });

    expect(result.current.progress).toBe(100);
  });

  it('returns 0% when content is not scrollable', () => {
    // scrollHeight equals clientHeight
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));
    expect(result.current.progress).toBe(0);
    expect(result.current.isVisible).toBe(false);
  });

  it('reset sets progress and isVisible back to defaults', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 750, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 750, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));

    act(() => {
      for (const listener of scrollListeners) {
        if (typeof listener === 'function') listener(new Event('scroll'));
      }
    });

    expect(result.current.progress).toBe(50);

    act(() => {
      result.current.reset();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isVisible).toBe(false);
  });

  it('adds scroll event listener on mount', () => {
    renderHook(() => useReadingProgress());
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('removes scroll event listener on unmount', () => {
    const { unmount } = renderHook(() => useReadingProgress());
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('works with container ref', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 200, writable: true, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true, configurable: true });

    const addSpy = vi.spyOn(container, 'addEventListener');

    const containerRef = { current: container };
    renderHook(() => useReadingProgress({ containerRef, throttleMs: 0 }));

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('clamps progress between 0 and 100', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 2000, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 2000, configurable: true });

    const { result } = renderHook(() => useReadingProgress({ throttleMs: 0 }));

    act(() => {
      for (const listener of scrollListeners) {
        if (typeof listener === 'function') listener(new Event('scroll'));
      }
    });

    expect(result.current.progress).toBeLessThanOrEqual(100);
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
  });
});
