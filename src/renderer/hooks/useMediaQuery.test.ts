import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let listeners: Map<string, ((e: MediaQueryListEvent) => void)[]>;
  let matchesMap: Map<string, boolean>;

  beforeEach(() => {
    listeners = new Map();
    matchesMap = new Map();

    window.matchMedia = vi.fn((query: string) => {
      if (!listeners.has(query)) listeners.set(query, []);
      return {
        matches: matchesMap.get(query) ?? false,
        media: query,
        addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.get(query)!.push(handler);
        }),
        removeEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
          const list = listeners.get(query)!;
          const idx = list.indexOf(handler);
          if (idx >= 0) list.splice(idx, 1);
        }),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    });
  });

  function fireChange(query: string, matches: boolean) {
    matchesMap.set(query, matches);
    const handlers = listeners.get(query) ?? [];
    for (const handler of handlers) {
      handler({ matches, media: query } as MediaQueryListEvent);
    }
  }

  it('returns false when query does not match', () => {
    matchesMap.set('(min-width: 1024px)', false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when query matches', () => {
    matchesMap.set('(prefers-color-scheme: dark)', true);
    const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));
    expect(result.current).toBe(true);
  });

  it('updates when media query changes', () => {
    matchesMap.set('(max-width: 768px)', false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => { fireChange('(max-width: 768px)', true); });
    expect(result.current).toBe(true);

    act(() => { fireChange('(max-width: 768px)', false); });
    expect(result.current).toBe(false);
  });

  it('cleans up listener on unmount', () => {
    matchesMap.set('(min-width: 500px)', false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 500px)'));
    // matchMedia may be called multiple times (useState initializer + useEffect)
    const results = (window.matchMedia as ReturnType<typeof vi.fn>).mock.results;
    const mql = results[results.length - 1].value;
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles query change by resubscribing', () => {
    matchesMap.set('(min-width: 500px)', true);
    matchesMap.set('(min-width: 1000px)', false);

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 500px)' } }
    );
    expect(result.current).toBe(true);

    rerender({ query: '(min-width: 1000px)' });
    expect(result.current).toBe(false);
  });

  it('works with prefers-reduced-motion', () => {
    matchesMap.set('(prefers-reduced-motion: reduce)', true);
    const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'));
    expect(result.current).toBe(true);
  });
});
