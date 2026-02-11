import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';

describe('useUndoRedo', () => {
  it('initializes with the given value', () => {
    const { result } = renderHook(() => useUndoRedo('hello'));
    expect(result.current.value).toBe('hello');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historySize).toBe(0);
  });

  it('updates value with set', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    expect(result.current.value).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historySize).toBe(1);
  });

  it('undoes to previous value', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    expect(result.current.value).toBe('c');
    act(() => result.current.undo());
    expect(result.current.value).toBe('b');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('redoes to next value after undo', () => {
    const { result } = renderHook(() => useUndoRedo(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.value).toBe(3);
    expect(result.current.canRedo).toBe(false);
  });

  it('clears future on new set after undo', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.set(99));
    expect(result.current.value).toBe(99);
    expect(result.current.canRedo).toBe(false);
  });

  it('does nothing on undo when no history', () => {
    const { result } = renderHook(() => useUndoRedo('only'));
    act(() => result.current.undo());
    expect(result.current.value).toBe('only');
  });

  it('does nothing on redo when no future', () => {
    const { result } = renderHook(() => useUndoRedo(10));
    act(() => result.current.set(20));
    act(() => result.current.redo());
    expect(result.current.value).toBe(20);
  });

  it('resets to new value clearing history and future', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    act(() => result.current.reset(100));
    expect(result.current.value).toBe(100);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historySize).toBe(0);
  });

  it('limits history to maxHistory', () => {
    const { result } = renderHook(() => useUndoRedo(0, 3));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.set(4));
    expect(result.current.historySize).toBe(3);
    // Can undo 3 times
    act(() => result.current.undo());
    expect(result.current.value).toBe(3);
    act(() => result.current.undo());
    expect(result.current.value).toBe(2);
    act(() => result.current.undo());
    expect(result.current.value).toBe(1);
    // No more undo
    act(() => result.current.undo());
    expect(result.current.value).toBe(1);
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useUndoRedo({ x: 1, y: 2 }));
    act(() => result.current.set({ x: 3, y: 4 }));
    expect(result.current.value).toEqual({ x: 3, y: 4 });
    act(() => result.current.undo());
    expect(result.current.value).toEqual({ x: 1, y: 2 });
  });

  it('supports multiple undo and redo in sequence', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    act(() => result.current.set('d'));
    // undo all the way
    act(() => result.current.undo());
    act(() => result.current.undo());
    act(() => result.current.undo());
    expect(result.current.value).toBe('a');
    // redo all the way
    act(() => result.current.redo());
    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.value).toBe('d');
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useUndoRedo(0));
    const { set, undo, redo, reset } = result.current;
    rerender();
    expect(result.current.set).toBe(set);
    expect(result.current.undo).toBe(undo);
    expect(result.current.redo).toBe(redo);
    expect(result.current.reset).toBe(reset);
  });

  it('set with different value then undo returns to original', () => {
    const { result } = renderHook(() => useUndoRedo(5));
    act(() => result.current.set(10));
    expect(result.current.historySize).toBe(1);
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.value).toBe(5);
  });

  it('historySize decreases on undo', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    expect(result.current.historySize).toBe(2);
    act(() => result.current.undo());
    expect(result.current.historySize).toBe(1);
    act(() => result.current.undo());
    expect(result.current.historySize).toBe(0);
  });

  it('redo after undo increases historySize', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current.set('b'));
    act(() => result.current.undo());
    expect(result.current.historySize).toBe(0);
    act(() => result.current.redo());
    expect(result.current.historySize).toBe(1);
  });

  it('canUndo is false after all undos', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);
  });

  it('canRedo is false after all redos', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.canRedo).toBe(false);
  });

  it('reset allows new set/undo cycle', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.reset(50));
    act(() => result.current.set(51));
    expect(result.current.historySize).toBe(1);
    act(() => result.current.undo());
    expect(result.current.value).toBe(50);
  });

  it('uses default maxHistory of 50', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    for (let i = 1; i <= 55; i++) {
      act(() => result.current.set(i));
    }
    expect(result.current.historySize).toBe(50);
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useUndoRedo<number[]>([]));
    act(() => result.current.set([1]));
    act(() => result.current.set([1, 2]));
    act(() => result.current.undo());
    expect(result.current.value).toEqual([1]);
  });
});
