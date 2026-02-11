import { renderHook, act } from '@testing-library/react';
import { useStateWithHistory } from './useStateWithHistory';

describe('useStateWithHistory', () => {
  it('initializes with the given value', () => {
    const { result } = renderHook(() => useStateWithHistory('hello'));
    expect(result.current.value).toBe('hello');
  });

  it('initial history contains one entry', () => {
    const { result } = renderHook(() => useStateWithHistory(42));
    expect(result.current.historySize).toBe(1);
    expect(result.current.history[0].value).toBe(42);
  });

  it('updates value with setValue', () => {
    const { result } = renderHook(() => useStateWithHistory(0));
    act(() => result.current.setValue(10));
    expect(result.current.value).toBe(10);
  });

  it('records history entries on setValue', () => {
    const { result } = renderHook(() => useStateWithHistory('a'));
    act(() => result.current.setValue('b'));
    act(() => result.current.setValue('c'));
    expect(result.current.historySize).toBe(3);
    expect(result.current.history[0].value).toBe('a');
    expect(result.current.history[1].value).toBe('b');
    expect(result.current.history[2].value).toBe('c');
  });

  it('history entries have timestamps', () => {
    const { result } = renderHook(() => useStateWithHistory(0));
    const t0 = result.current.history[0].timestamp;
    expect(typeof t0).toBe('number');
    expect(t0).toBeGreaterThan(0);
    act(() => result.current.setValue(1));
    expect(result.current.history[1].timestamp).toBeGreaterThanOrEqual(t0);
  });

  it('limits history to maxHistory', () => {
    const { result } = renderHook(() => useStateWithHistory(0, 3));
    act(() => result.current.setValue(1));
    act(() => result.current.setValue(2));
    act(() => result.current.setValue(3));
    act(() => result.current.setValue(4));
    expect(result.current.historySize).toBe(3);
    expect(result.current.history[0].value).toBe(2);
    expect(result.current.history[1].value).toBe(3);
    expect(result.current.history[2].value).toBe(4);
  });

  it('clearHistory keeps only current value', () => {
    const { result } = renderHook(() => useStateWithHistory('a'));
    act(() => result.current.setValue('b'));
    act(() => result.current.setValue('c'));
    expect(result.current.historySize).toBe(3);
    act(() => result.current.clearHistory());
    expect(result.current.historySize).toBe(1);
    expect(result.current.history[0].value).toBe('c');
    expect(result.current.value).toBe('c');
  });

  it('goTo sets value to a specific history entry', () => {
    const { result } = renderHook(() => useStateWithHistory(10));
    act(() => result.current.setValue(20));
    act(() => result.current.setValue(30));
    act(() => result.current.goTo(0));
    expect(result.current.value).toBe(10);
  });

  it('goTo ignores out-of-bounds negative index', () => {
    const { result } = renderHook(() => useStateWithHistory(5));
    act(() => result.current.goTo(-1));
    expect(result.current.value).toBe(5);
  });

  it('goTo ignores out-of-bounds high index', () => {
    const { result } = renderHook(() => useStateWithHistory(5));
    act(() => result.current.goTo(99));
    expect(result.current.value).toBe(5);
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useStateWithHistory({ x: 1 }));
    act(() => result.current.setValue({ x: 2 }));
    expect(result.current.value).toEqual({ x: 2 });
    expect(result.current.history[0].value).toEqual({ x: 1 });
    expect(result.current.history[1].value).toEqual({ x: 2 });
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useStateWithHistory(0));
    const { setValue, clearHistory, goTo } = result.current;
    rerender();
    expect(result.current.setValue).toBe(setValue);
    expect(result.current.clearHistory).toBe(clearHistory);
    expect(result.current.goTo).toBe(goTo);
  });

  it('default maxHistory is 100', () => {
    const { result } = renderHook(() => useStateWithHistory(0));
    for (let i = 1; i <= 110; i++) {
      act(() => result.current.setValue(i));
    }
    expect(result.current.historySize).toBe(100);
  });

  it('goTo to middle entry works correctly', () => {
    const { result } = renderHook(() => useStateWithHistory('a'));
    act(() => result.current.setValue('b'));
    act(() => result.current.setValue('c'));
    act(() => result.current.setValue('d'));
    act(() => result.current.goTo(2));
    expect(result.current.value).toBe('c');
  });
});
