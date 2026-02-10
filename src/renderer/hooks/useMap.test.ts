import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMap } from './useMap';

describe('useMap', () => {
  it('initializes empty by default', () => {
    const { result } = renderHook(() => useMap<string, number>());
    expect(result.current.size).toBe(0);
    expect(result.current.entries).toEqual([]);
  });

  it('initializes with provided entries', () => {
    const initial: [string, number][] = [['a', 1], ['b', 2]];
    const { result } = renderHook(() => useMap<string, number>(initial));
    expect(result.current.size).toBe(2);
    expect(result.current.get('a')).toBe(1);
    expect(result.current.get('b')).toBe(2);
  });

  it('sets a new entry', () => {
    const { result } = renderHook(() => useMap<string, number>());

    act(() => {
      result.current.set('key', 42);
    });

    expect(result.current.size).toBe(1);
    expect(result.current.get('key')).toBe(42);
  });

  it('updates an existing entry', () => {
    const { result } = renderHook(() => useMap<string, number>([['k', 1]]));

    act(() => {
      result.current.set('k', 99);
    });

    expect(result.current.get('k')).toBe(99);
    expect(result.current.size).toBe(1);
  });

  it('removes an entry', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1], ['b', 2]]));

    act(() => {
      result.current.remove('a');
    });

    expect(result.current.size).toBe(1);
    expect(result.current.has('a')).toBe(false);
    expect(result.current.has('b')).toBe(true);
  });

  it('handles remove of non-existent key', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1]]));

    act(() => {
      result.current.remove('nonexistent');
    });

    expect(result.current.size).toBe(1);
  });

  it('clears all entries', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1], ['b', 2]]));

    act(() => {
      result.current.clear();
    });

    expect(result.current.size).toBe(0);
    expect(result.current.entries).toEqual([]);
  });

  it('checks existence with has', () => {
    const { result } = renderHook(() => useMap<string, number>([['x', 10]]));
    expect(result.current.has('x')).toBe(true);
    expect(result.current.has('y')).toBe(false);
  });

  it('returns undefined for non-existent keys', () => {
    const { result } = renderHook(() => useMap<string, number>());
    expect(result.current.get('missing')).toBeUndefined();
  });

  it('provides keys array', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1], ['b', 2]]));
    expect(result.current.keys).toEqual(['a', 'b']);
  });

  it('provides values array', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1], ['b', 2]]));
    expect(result.current.values).toEqual([1, 2]);
  });

  it('provides entries array', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1]]));
    expect(result.current.entries).toEqual([['a', 1]]);
  });

  it('resets to initial entries', () => {
    const initial: [string, number][] = [['a', 1]];
    const { result } = renderHook(() => useMap<string, number>(initial));

    act(() => {
      result.current.set('b', 2);
      result.current.set('c', 3);
    });

    expect(result.current.size).toBe(3);

    act(() => {
      result.current.reset();
    });

    expect(result.current.size).toBe(1);
    expect(result.current.get('a')).toBe(1);
  });
});
