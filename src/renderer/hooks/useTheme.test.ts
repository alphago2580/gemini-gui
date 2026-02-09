import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  let matchMediaListeners: Array<(e: { matches: boolean }) => void>;
  let matchMediaMatches: boolean;

  beforeEach(() => {
    localStorage.clear();
    matchMediaListeners = [];
    matchMediaMatches = true; // default: prefers dark

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? matchMediaMatches : !matchMediaMatches,
        media: query,
        addEventListener: (_event: string, handler: (e: { matches: boolean }) => void) => {
          matchMediaListeners.push(handler);
        },
        removeEventListener: (_event: string, handler: (e: { matches: boolean }) => void) => {
          matchMediaListeners = matchMediaListeners.filter(h => h !== handler);
        },
      })),
    });

    // Mock document.documentElement.setAttribute
    vi.spyOn(document.documentElement, 'setAttribute');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to dark theme when no saved preference', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.themeMode).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('restores saved theme from localStorage', () => {
    localStorage.setItem('gemini-theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.themeMode).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('sets data-theme attribute on document', () => {
    renderHook(() => useTheme());
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('changes theme mode and persists to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('light');
    });
    expect(result.current.themeMode).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(localStorage.getItem('gemini-theme')).toBe('light');
  });

  it('applies data-theme attribute when theme changes', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('light');
    });
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('resolves system theme to dark when system prefers dark', () => {
    matchMediaMatches = true;
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('system');
    });
    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('resolves system theme to light when system prefers light', () => {
    matchMediaMatches = false;
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('system');
    });
    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('listens for system theme changes when mode is system', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('system');
    });
    expect(matchMediaListeners.length).toBeGreaterThan(0);
  });

  it('does not listen for system theme changes when mode is not system', () => {
    renderHook(() => useTheme());
    // Default mode is 'dark', not 'system'
    expect(matchMediaListeners.length).toBe(0);
  });

  it('cleans up system theme listener on unmount', () => {
    const { result, unmount } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('system');
    });
    const listenerCount = matchMediaListeners.length;
    expect(listenerCount).toBeGreaterThan(0);
    unmount();
    expect(matchMediaListeners.length).toBe(0);
  });

  it('handles invalid localStorage value gracefully', () => {
    localStorage.setItem('gemini-theme', 'invalid-value');
    const { result } = renderHook(() => useTheme());
    expect(result.current.themeMode).toBe('dark');
  });

  it('persists system mode to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setThemeMode('system');
    });
    expect(localStorage.getItem('gemini-theme')).toBe('system');
  });
});
