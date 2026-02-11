import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHistoryState } from './useHistoryState';

describe('useHistoryState', () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    Object.defineProperty(window.history, 'state', { value: null, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state when no history state exists', () => {
    const { result } = renderHook(() => useHistoryState('test', 'initial'));
    expect(result.current.state).toBe('initial');
  });

  it('restores state from history on mount', () => {
    Object.defineProperty(window.history, 'state', {
      value: { myKey: 'restored' },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHistoryState('myKey', 'default'));
    expect(result.current.state).toBe('restored');
  });

  it('push() calls pushState and updates state', () => {
    const { result } = renderHook(() => useHistoryState('key', 0));

    act(() => {
      result.current.push(42);
    });

    expect(pushStateSpy).toHaveBeenCalledWith({ key: 42 }, '', undefined);
    expect(result.current.state).toBe(42);
  });

  it('push() with URL', () => {
    const { result } = renderHook(() => useHistoryState('page', 'home'));

    act(() => {
      result.current.push('about', '', '/about');
    });

    expect(pushStateSpy).toHaveBeenCalledWith({ page: 'about' }, '', '/about');
    expect(result.current.state).toBe('about');
  });

  it('replace() calls replaceState and updates state', () => {
    const { result } = renderHook(() => useHistoryState('key', 'a'));

    act(() => {
      result.current.replace('b');
    });

    expect(replaceStateSpy).toHaveBeenCalledWith({ key: 'b' }, '', undefined);
    expect(result.current.state).toBe('b');
  });

  it('replace() with URL', () => {
    const { result } = renderHook(() => useHistoryState('page', 'home'));

    act(() => {
      result.current.replace('contact', '', '/contact');
    });

    expect(replaceStateSpy).toHaveBeenCalledWith({ page: 'contact' }, '', '/contact');
  });

  it('responds to popstate events', () => {
    const { result } = renderHook(() => useHistoryState('nav', 'page1'));

    act(() => {
      const event = new PopStateEvent('popstate', {
        state: { nav: 'page2' },
      });
      window.dispatchEvent(event);
    });

    expect(result.current.state).toBe('page2');
  });

  it('resets to initial state on popstate with no matching key', () => {
    const { result } = renderHook(() => useHistoryState('nav', 'default'));

    act(() => {
      result.current.push('page1');
    });

    act(() => {
      const event = new PopStateEvent('popstate', {
        state: { other: 'value' },
      });
      window.dispatchEvent(event);
    });

    expect(result.current.state).toBe('default');
  });

  it('resets to initial on popstate with null state', () => {
    const { result } = renderHook(() => useHistoryState('nav', 'init'));

    act(() => {
      result.current.push('something');
    });

    act(() => {
      const event = new PopStateEvent('popstate', { state: null });
      window.dispatchEvent(event);
    });

    expect(result.current.state).toBe('init');
  });

  it('cleans up popstate listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHistoryState('key', 'val'));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('push/replace are stable across renders', () => {
    const { result, rerender } = renderHook(() => useHistoryState('key', 'val'));
    const firstPush = result.current.push;
    const firstReplace = result.current.replace;

    rerender();

    expect(result.current.push).toBe(firstPush);
    expect(result.current.replace).toBe(firstReplace);
  });

  it('return shape matches UseHistoryStateResult', () => {
    const { result } = renderHook(() => useHistoryState('k', 0));
    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('push');
    expect(result.current).toHaveProperty('replace');
    expect(typeof result.current.push).toBe('function');
    expect(typeof result.current.replace).toBe('function');
  });

  it('works with object state', () => {
    const { result } = renderHook(() =>
      useHistoryState('data', { count: 0 })
    );

    act(() => {
      result.current.push({ count: 5 });
    });

    expect(result.current.state).toEqual({ count: 5 });
  });

  it('preserves other history state keys on push', () => {
    Object.defineProperty(window.history, 'state', {
      value: { existing: 'value' },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHistoryState('newKey', 'init'));

    act(() => {
      result.current.push('updated');
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      { existing: 'value', newKey: 'updated' },
      '',
      undefined
    );
  });
});
