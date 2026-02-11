import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it('accepts initial value true', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it('toggles the value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it('setTrue sets value to true', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
    // Calling again should keep it true
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });

  it('setFalse sets value to false', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });

  it('setValue sets to specific value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.setValue(true));
    expect(result.current.value).toBe(true);
    act(() => result.current.setValue(false));
    expect(result.current.value).toBe(false);
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const { toggle, setTrue, setFalse } = result.current;
    rerender();
    expect(result.current.toggle).toBe(toggle);
    expect(result.current.setTrue).toBe(setTrue);
    expect(result.current.setFalse).toBe(setFalse);
  });

  it('triple toggle from false results in true', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
  });

  it('setTrue after toggle preserves true', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.toggle());
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });

  it('setFalse after toggle resets to false', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.toggle());
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });

  it('setValue stability matches useState setter', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const { setValue } = result.current;
    rerender();
    expect(result.current.setValue).toBe(setValue);
  });

  it('return shape has all expected properties', () => {
    const { result } = renderHook(() => useToggle());
    expect(typeof result.current.value).toBe('boolean');
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.setTrue).toBe('function');
    expect(typeof result.current.setFalse).toBe('function');
    expect(typeof result.current.setValue).toBe('function');
  });

  it('callbacks stable after state changes', () => {
    const { result } = renderHook(() => useToggle());
    const { toggle, setTrue, setFalse } = result.current;
    act(() => result.current.toggle());
    expect(result.current.toggle).toBe(toggle);
    expect(result.current.setTrue).toBe(setTrue);
    expect(result.current.setFalse).toBe(setFalse);
  });

  it('setValue with same value is idempotent', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.setValue(true));
    expect(result.current.value).toBe(true);
  });

  it('even number of toggles returns to original', () => {
    const { result } = renderHook(() => useToggle(false));
    for (let i = 0; i < 10; i++) {
      act(() => result.current.toggle());
    }
    expect(result.current.value).toBe(false);
  });
});
