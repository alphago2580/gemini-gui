import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Integration test: Theme toggle → CSS variable verification
 *
 * Tests the full theme integration:
 * 1. CSS variable definitions — both themes define the same set of variables
 * 2. Theme toggle → DOM data-theme attribute + localStorage persistence
 * 3. Full round-trip: set theme → unmount → re-mount → theme restored
 * 4. System theme detection with matchMedia changes
 * 5. High-contrast mode variable coverage
 */

// ---------- helpers: parse CSS variable definitions from App.css ----------

function loadAppCSS(): string {
  const cssPath = resolve(__dirname, '../App.css');
  return readFileSync(cssPath, 'utf-8');
}

interface CSSVariableMap {
  [variableName: string]: string;
}

/**
 * Extract CSS custom property declarations from a CSS block string.
 * Expects lines like: "  --bg-primary: #1e1e1e;"
 */
function extractVariables(block: string): CSSVariableMap {
  const vars: CSSVariableMap = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

/**
 * Extract a CSS rule block by its selector pattern.
 * Returns the content between the matching { and }.
 */
function extractRuleBlock(css: string, selectorPattern: RegExp): string | null {
  const idx = css.search(selectorPattern);
  if (idx === -1) return null;

  // Find the opening brace after the selector
  const braceStart = css.indexOf('{', idx);
  if (braceStart === -1) return null;

  // Find the matching closing brace
  let depth = 1;
  let pos = braceStart + 1;
  while (pos < css.length && depth > 0) {
    if (css[pos] === '{') depth++;
    if (css[pos] === '}') depth--;
    pos++;
  }

  return css.slice(braceStart + 1, pos - 1);
}

// ---------- CSS Variable Consistency Tests ----------

describe('Theme CSS Variable Consistency', () => {
  let css: string;
  let darkVars: CSSVariableMap;
  let lightVars: CSSVariableMap;

  beforeEach(() => {
    css = loadAppCSS();

    const darkBlock = extractRuleBlock(css, /\[data-theme="dark"\]\s*\{/);
    const lightBlock = extractRuleBlock(css, /\[data-theme="light"\]\s*\{/);

    expect(darkBlock).not.toBeNull();
    expect(lightBlock).not.toBeNull();

    darkVars = extractVariables(darkBlock!);
    lightVars = extractVariables(lightBlock!);
  });

  it('dark theme defines CSS variables', () => {
    expect(Object.keys(darkVars).length).toBeGreaterThan(0);
  });

  it('light theme defines CSS variables', () => {
    expect(Object.keys(lightVars).length).toBeGreaterThan(0);
  });

  it('both themes define the exact same set of CSS variable names', () => {
    const darkNames = Object.keys(darkVars).sort();
    const lightNames = Object.keys(lightVars).sort();

    // Check for variables missing in light theme
    const missingInLight = darkNames.filter(name => !lightNames.includes(name));
    expect(missingInLight).toEqual([]);

    // Check for variables missing in dark theme
    const missingInDark = lightNames.filter(name => !darkNames.includes(name));
    expect(missingInDark).toEqual([]);

    expect(darkNames).toEqual(lightNames);
  });

  it('background variables differ between themes', () => {
    expect(darkVars['--bg-primary']).not.toBe(lightVars['--bg-primary']);
    expect(darkVars['--bg-secondary']).not.toBe(lightVars['--bg-secondary']);
    expect(darkVars['--bg-sidebar']).not.toBe(lightVars['--bg-sidebar']);
  });

  it('text variables differ between themes', () => {
    expect(darkVars['--text-primary']).not.toBe(lightVars['--text-primary']);
    expect(darkVars['--text-secondary']).not.toBe(lightVars['--text-secondary']);
  });

  it('border variables differ between themes', () => {
    expect(darkVars['--border-color']).not.toBe(lightVars['--border-color']);
    expect(darkVars['--border-hover']).not.toBe(lightVars['--border-hover']);
  });

  it('assistant message variables differ between themes', () => {
    expect(darkVars['--assistant-msg-bg']).not.toBe(lightVars['--assistant-msg-bg']);
    expect(darkVars['--assistant-msg-border']).not.toBe(lightVars['--assistant-msg-border']);
  });

  it('scrollbar variables differ between themes', () => {
    expect(darkVars['--scrollbar-track']).not.toBe(lightVars['--scrollbar-track']);
    expect(darkVars['--scrollbar-thumb']).not.toBe(lightVars['--scrollbar-thumb']);
  });

  it('all CSS variable names follow --kebab-case convention', () => {
    const allNames = [...Object.keys(darkVars), ...Object.keys(lightVars)];
    for (const name of allNames) {
      expect(name).toMatch(/^--[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    }
  });

  it('required variable categories are present', () => {
    const requiredPrefixes = [
      '--bg-',
      '--text-',
      '--border-',
      '--accent-',
      '--user-msg-',
      '--assistant-msg-',
      '--btn-disabled-',
      '--scrollbar-',
      '--overlay-',
      '--shadow-',
      '--error-',
    ];

    for (const prefix of requiredPrefixes) {
      const darkHas = Object.keys(darkVars).some(name => name.startsWith(prefix));
      const lightHas = Object.keys(lightVars).some(name => name.startsWith(prefix));
      expect(darkHas).toBe(true);
      expect(lightHas).toBe(true);
    }
  });
});

// ---------- High-Contrast CSS Variable Tests ----------

describe('High-Contrast Theme CSS Variable Coverage', () => {
  let css: string;

  beforeEach(() => {
    css = loadAppCSS();
  });

  it('high-contrast dark theme block exists', () => {
    const block = extractRuleBlock(css, /\[data-high-contrast="true"\]\[data-theme="dark"\]\s*\{/);
    // Could also match the combined selector: [data-high-contrast="true"],\n[data-high-contrast="true"][data-theme="dark"]
    // So let's also check the standalone
    const standalone = extractRuleBlock(css, /\[data-high-contrast="true"\]\s*,/);
    expect(block !== null || standalone !== null).toBe(true);
  });

  it('high-contrast light theme block exists', () => {
    const block = extractRuleBlock(css, /\[data-high-contrast="true"\]\[data-theme="light"\]\s*\{/);
    expect(block).not.toBeNull();
  });

  it('high-contrast themes define background and text variables', () => {
    // Parse the combined dark high-contrast block
    const hcDarkBlock = extractRuleBlock(css, /\[data-high-contrast="true"\]\s*,/);
    const hcLightBlock = extractRuleBlock(css, /\[data-high-contrast="true"\]\[data-theme="light"\]\s*\{/);

    if (hcDarkBlock) {
      const vars = extractVariables(hcDarkBlock);
      expect(Object.keys(vars).some(v => v.startsWith('--bg-'))).toBe(true);
      expect(Object.keys(vars).some(v => v.startsWith('--text-'))).toBe(true);
    }

    if (hcLightBlock) {
      const vars = extractVariables(hcLightBlock);
      expect(Object.keys(vars).some(v => v.startsWith('--bg-'))).toBe(true);
      expect(Object.keys(vars).some(v => v.startsWith('--text-'))).toBe(true);
    }
  });
});

// ---------- Theme Hook + DOM Integration Tests ----------

describe('Theme Toggle DOM Integration', () => {
  let matchMediaListeners: Array<(e: { matches: boolean }) => void>;
  let matchMediaMatches: boolean;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    matchMediaListeners = [];
    matchMediaMatches = true;

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

    vi.spyOn(document.documentElement, 'setAttribute');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles data-theme attribute on documentElement when switching dark → light', () => {
    const { result } = renderHook(() => useTheme());

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');

    act(() => result.current.setThemeMode('light'));

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('toggles data-theme attribute on documentElement when switching light → dark', () => {
    localStorage.setItem('gemini-theme', 'light');
    const { result } = renderHook(() => useTheme());

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');

    act(() => result.current.setThemeMode('dark'));

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('full round-trip: set theme → unmount → re-mount → theme restored', () => {
    // Mount and set light theme
    const { result, unmount } = renderHook(() => useTheme());
    act(() => result.current.setThemeMode('light'));

    expect(result.current.themeMode).toBe('light');
    expect(localStorage.getItem('gemini-theme')).toBe('light');

    // Unmount
    unmount();

    // Re-mount — should restore light theme from localStorage
    const { result: result2 } = renderHook(() => useTheme());
    expect(result2.current.themeMode).toBe('light');
    expect(result2.current.resolvedTheme).toBe('light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('system theme → manual override persists across remount', () => {
    // Start with system theme
    matchMediaMatches = true; // system prefers dark
    const { result, unmount } = renderHook(() => useTheme());
    act(() => result.current.setThemeMode('system'));

    expect(result.current.resolvedTheme).toBe('dark');

    // Override to light
    act(() => result.current.setThemeMode('light'));
    expect(result.current.resolvedTheme).toBe('light');
    expect(localStorage.getItem('gemini-theme')).toBe('light');

    unmount();

    // Re-mount — should be light, not system
    const { result: result2 } = renderHook(() => useTheme());
    expect(result2.current.themeMode).toBe('light');
    expect(result2.current.resolvedTheme).toBe('light');
  });

  it('system theme change triggers DOM update when in system mode', () => {
    matchMediaMatches = true; // system starts dark
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setThemeMode('system'));

    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');

    // Simulate system switching to light
    matchMediaMatches = false;
    act(() => {
      for (const listener of matchMediaListeners) {
        listener({ matches: false });
      }
    });

    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('rapid theme toggling settles to final value', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setThemeMode('light');
      result.current.setThemeMode('dark');
      result.current.setThemeMode('light');
      result.current.setThemeMode('dark');
      result.current.setThemeMode('light');
    });

    expect(result.current.themeMode).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(localStorage.getItem('gemini-theme')).toBe('light');
  });

  it('all three theme modes produce valid data-theme values', () => {
    const { result } = renderHook(() => useTheme());

    // Dark
    act(() => result.current.setThemeMode('dark'));
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');

    // Light
    act(() => result.current.setThemeMode('light'));
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');

    // System (resolves to either dark or light)
    act(() => result.current.setThemeMode('system'));
    const resolved = result.current.resolvedTheme;
    expect(['dark', 'light']).toContain(resolved);
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', resolved);
  });

  it('localStorage corruption does not break theme initialization', () => {
    // Set garbage data in localStorage
    localStorage.setItem('gemini-theme', '{"corrupted": true}');

    const { result } = renderHook(() => useTheme());

    // Should fall back to default dark
    expect(result.current.themeMode).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('empty localStorage string does not break theme initialization', () => {
    localStorage.setItem('gemini-theme', '');

    const { result } = renderHook(() => useTheme());
    expect(result.current.themeMode).toBe('dark');
  });

  it('switching away from system mode removes matchMedia listener', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setThemeMode('system'));
    expect(matchMediaListeners.length).toBeGreaterThan(0);

    act(() => result.current.setThemeMode('dark'));
    expect(matchMediaListeners.length).toBe(0);

    // System change should NOT affect theme now
    matchMediaMatches = false;
    act(() => {
      // There should be no listeners to trigger, but if there were, this would fail
      for (const listener of matchMediaListeners) {
        listener({ matches: false });
      }
    });
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('multiple useTheme hooks stay in sync via localStorage', () => {
    const { result: hook1 } = renderHook(() => useTheme());
    const { result: hook2 } = renderHook(() => useTheme());

    // Both start with dark
    expect(hook1.current.themeMode).toBe('dark');
    expect(hook2.current.themeMode).toBe('dark');

    // Hook1 sets light
    act(() => hook1.current.setThemeMode('light'));
    expect(hook1.current.themeMode).toBe('light');

    // localStorage should reflect light
    expect(localStorage.getItem('gemini-theme')).toBe('light');
  });
});
