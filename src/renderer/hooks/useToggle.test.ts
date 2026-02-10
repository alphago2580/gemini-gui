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
});
