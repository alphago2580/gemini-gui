import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;
  let matchesValue: boolean;

  beforeEach(() => {
    listeners = new Map();
    matchesValue = false;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesValue,
        media: query,
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)!.add(handler);
        }),
        removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.get(event)?.delete(handler);
        }),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when no preference', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion preferred', () => {
    matchesValue = true;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when preference changes', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      const changeHandlers = listeners.get('change');
      if (changeHandlers) {
        for (const handler of changeHandlers) {
          handler({ matches: true } as MediaQueryListEvent);
        }
      }
    });

    expect(result.current).toBe(true);
  });

  it('updates back to false', () => {
    matchesValue = true;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      const changeHandlers = listeners.get('change');
      if (changeHandlers) {
        for (const handler of changeHandlers) {
          handler({ matches: false } as MediaQueryListEvent);
        }
      }
    });

    expect(result.current).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    const handlersBeforeUnmount = listeners.get('change')?.size ?? 0;
    expect(handlersBeforeUnmount).toBeGreaterThan(0);

    unmount();
    const handlersAfterUnmount = listeners.get('change')?.size ?? 0;
    expect(handlersAfterUnmount).toBe(0);
  });

  it('queries correct media string', () => {
    renderHook(() => usePrefersReducedMotion());
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
