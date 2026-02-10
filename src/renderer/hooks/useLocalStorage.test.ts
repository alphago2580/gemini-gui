import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('works with object values', () => {
    const initial = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj-key', initial));

    expect(result.current[0]).toEqual(initial);

    act(() => {
      result.current[1]({ name: 'updated', count: 1 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
    expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual({ name: 'updated', count: 1 });
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));

    act(() => {
      result.current[1](['a', 'b']);
    });

    expect(result.current[0]).toEqual(['a', 'b']);
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('bad-key', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](prev => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('persists value on initial render', () => {
    renderHook(() => useLocalStorage('persist-key', 42));
    expect(JSON.parse(localStorage.getItem('persist-key')!)).toBe(42);
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));
    expect(result.current[0]).toBe(false);
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    expect(JSON.parse(localStorage.getItem('bool-key')!)).toBe(true);
  });

  it('works with null initial value', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('null-key', null));
    expect(result.current[0]).toBeNull();
    act(() => {
      result.current[1]('non-null');
    });
    expect(result.current[0]).toBe('non-null');
  });

  it('returns stored null from localStorage', () => {
    localStorage.setItem('stored-null', JSON.stringify(null));
    const { result } = renderHook(() => useLocalStorage<string | null>('stored-null', 'default'));
    expect(result.current[0]).toBeNull();
  });

  it('handles empty string stored in localStorage', () => {
    localStorage.setItem('empty-str', JSON.stringify(''));
    const { result } = renderHook(() => useLocalStorage('empty-str', 'fallback'));
    expect(result.current[0]).toBe('');
  });

  it('works with nested object values', () => {
    const nested = { a: { b: { c: 42 } }, d: [1, 2, 3] };
    const { result } = renderHook(() => useLocalStorage('nested-key', nested));
    expect(result.current[0]).toEqual(nested);
    act(() => {
      result.current[1]({ a: { b: { c: 100 } }, d: [4, 5] });
    });
    expect(result.current[0]).toEqual({ a: { b: { c: 100 } }, d: [4, 5] });
  });

  it('setValue function reference is stable across renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('stable-key', 0));
    const firstSetter = result.current[1];
    rerender();
    expect(result.current[1]).toBe(firstSetter);
  });

  it('updates localStorage when key changes via rerender', () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'default'),
      { initialProps: { key: 'key-a' } }
    );
    expect(result.current[0]).toBe('default');
    expect(JSON.parse(localStorage.getItem('key-a')!)).toBe('default');

    rerender({ key: 'key-b' });
    expect(JSON.parse(localStorage.getItem('key-b')!)).toBe('default');
  });

  it('works with number zero (falsy but valid JSON)', () => {
    localStorage.setItem('zero-key', JSON.stringify(0));
    const { result } = renderHook(() => useLocalStorage('zero-key', 999));
    expect(result.current[0]).toBe(0);
  });
});
