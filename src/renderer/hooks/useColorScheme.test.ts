import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useColorScheme } from './useColorScheme';

describe('useColorScheme', () => {
  let matchMediaListeners: Map<string, (e: MediaQueryListEvent) => void>;
  let mockMatches: boolean;
  let mockMediaQueryList: ReturnType<typeof createMockMQL>;

  function createMockMQL(query: string) {
    return {
      matches: mockMatches,
      media: query,
      addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
        matchMediaListeners.set(query, handler);
      }),
      removeEventListener: vi.fn((_event: string, _handler: (e: MediaQueryListEvent) => void) => {
        matchMediaListeners.delete(query);
      }),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }

  beforeEach(() => {
    matchMediaListeners = new Map();
    mockMatches = false;
    localStorage.clear();
    mockMediaQueryList = createMockMQL('(prefers-color-scheme: dark)');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        mockMediaQueryList.media = query;
        mockMediaQueryList.matches = mockMatches;
        return mockMediaQueryList;
      }),
    });
  });

  afterEach(() => {
    localStorage.clear();
    matchMediaListeners.clear();
  });

  it('defaults to system scheme (light)', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.scheme).toBe('light');
    expect(result.current.isSystem).toBe(true);
  });

  it('defaults to dark when system prefers dark', () => {
    mockMatches = true;
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.scheme).toBe('dark');
    expect(result.current.systemScheme).toBe('dark');
    expect(result.current.isSystem).toBe(true);
  });

  it('sets explicit light scheme', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('light');
    });

    expect(result.current.scheme).toBe('light');
    expect(result.current.isSystem).toBe(false);
  });

  it('sets explicit dark scheme', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('dark');
    });

    expect(result.current.scheme).toBe('dark');
    expect(result.current.isSystem).toBe(false);
  });

  it('switches back to system mode', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('dark');
    });
    expect(result.current.isSystem).toBe(false);

    act(() => {
      result.current.setScheme('system');
    });
    expect(result.current.isSystem).toBe(true);
    expect(result.current.scheme).toBe('light');
  });

  it('persists preference to localStorage', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('dark');
    });

    expect(localStorage.getItem('color-scheme-preference')).toBe('dark');
  });

  it('restores preference from localStorage', () => {
    localStorage.setItem('color-scheme-preference', 'dark');
    const { result } = renderHook(() => useColorScheme());

    expect(result.current.scheme).toBe('dark');
    expect(result.current.isSystem).toBe(false);
  });

  it('restores system preference from localStorage', () => {
    localStorage.setItem('color-scheme-preference', 'system');
    const { result } = renderHook(() => useColorScheme());

    expect(result.current.isSystem).toBe(true);
  });

  it('ignores invalid localStorage values', () => {
    localStorage.setItem('color-scheme-preference', 'invalid');
    const { result } = renderHook(() => useColorScheme());

    expect(result.current.isSystem).toBe(true);
  });

  it('responds to system scheme changes', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.systemScheme).toBe('light');

    const handler = matchMediaListeners.get('(prefers-color-scheme: dark)');
    if (handler) {
      act(() => {
        handler({ matches: true } as MediaQueryListEvent);
      });
    }

    expect(result.current.systemScheme).toBe('dark');
    expect(result.current.scheme).toBe('dark');
  });

  it('system scheme change does not affect explicit preference', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('light');
    });

    const handler = matchMediaListeners.get('(prefers-color-scheme: dark)');
    if (handler) {
      act(() => {
        handler({ matches: true } as MediaQueryListEvent);
      });
    }

    expect(result.current.scheme).toBe('light');
    expect(result.current.systemScheme).toBe('dark');
    expect(result.current.isSystem).toBe(false);
  });

  it('cleans up media query listener on unmount', () => {
    const { unmount } = renderHook(() => useColorScheme());

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('return shape matches UseColorSchemeResult', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toHaveProperty('scheme');
    expect(result.current).toHaveProperty('systemScheme');
    expect(result.current).toHaveProperty('isSystem');
    expect(result.current).toHaveProperty('setScheme');
    expect(typeof result.current.setScheme).toBe('function');
  });

  it('setScheme is stable across renders', () => {
    const { result, rerender } = renderHook(() => useColorScheme());
    const firstSetScheme = result.current.setScheme;

    rerender();

    expect(result.current.setScheme).toBe(firstSetScheme);
  });

  it('persists system preference to localStorage', () => {
    const { result } = renderHook(() => useColorScheme());

    act(() => {
      result.current.setScheme('dark');
    });
    act(() => {
      result.current.setScheme('system');
    });

    expect(localStorage.getItem('color-scheme-preference')).toBe('system');
  });
});
