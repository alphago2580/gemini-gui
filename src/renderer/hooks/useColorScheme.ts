import { useState, useEffect, useCallback } from 'react';

export type ColorScheme = 'light' | 'dark';

export interface UseColorSchemeResult {
  scheme: ColorScheme;
  systemScheme: ColorScheme;
  isSystem: boolean;
  setScheme: (scheme: ColorScheme | 'system') => void;
}

const STORAGE_KEY = 'color-scheme-preference';

function getSystemScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference(): ColorScheme | 'system' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return 'system';
}

/**
 * Hook for managing color scheme preference with system detection.
 * Supports explicit light/dark or following system preference.
 * Persists user preference to localStorage.
 */
export function useColorScheme(): UseColorSchemeResult {
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(getSystemScheme);
  const [preference, setPreference] = useState<ColorScheme | 'system'>(getStoredPreference);

  const scheme: ColorScheme = preference === 'system' ? systemScheme : preference;
  const isSystem = preference === 'system';

  const setScheme = useCallback((newScheme: ColorScheme | 'system') => {
    setPreference(newScheme);
    try {
      localStorage.setItem(STORAGE_KEY, newScheme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { scheme, systemScheme, isSystem, setScheme };
}
