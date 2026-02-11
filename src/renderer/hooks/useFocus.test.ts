import { renderHook, act } from '@testing-library/react';
import { useFocus } from './useFocus';

describe('useFocus', () => {
  it('initializes with isFocused false', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current.isFocused).toBe(false);
  });

  it('sets isFocused true on onFocus', () => {
    const { result } = renderHook(() => useFocus());
    act(() => result.current.onFocus());
    expect(result.current.isFocused).toBe(true);
  });

  it('sets isFocused false on onBlur', () => {
    const { result } = renderHook(() => useFocus());
    act(() => result.current.onFocus());
    expect(result.current.isFocused).toBe(true);
    act(() => result.current.onBlur());
    expect(result.current.isFocused).toBe(false);
  });

  it('provides a ref object', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it('focus() calls element.focus()', () => {
    const { result } = renderHook(() => useFocus());
    const mockElement = { focus: vi.fn(), blur: vi.fn() } as unknown as HTMLElement;
    (result.current.ref as { current: HTMLElement | null }).current = mockElement;

    act(() => result.current.focus());
    expect(mockElement.focus).toHaveBeenCalled();
  });

  it('blur() calls element.blur()', () => {
    const { result } = renderHook(() => useFocus());
    const mockElement = { focus: vi.fn(), blur: vi.fn() } as unknown as HTMLElement;
    (result.current.ref as { current: HTMLElement | null }).current = mockElement;

    act(() => result.current.blur());
    expect(mockElement.blur).toHaveBeenCalled();
  });

  it('focus() does nothing when ref is null', () => {
    const { result } = renderHook(() => useFocus());
    // Should not throw
    act(() => result.current.focus());
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useFocus());
    const { onFocus, onBlur, focus, blur } = result.current;
    rerender();
    expect(result.current.onFocus).toBe(onFocus);
    expect(result.current.onBlur).toBe(onBlur);
    expect(result.current.focus).toBe(focus);
    expect(result.current.blur).toBe(blur);
  });

  it('blur() does nothing when ref is null', () => {
    const { result } = renderHook(() => useFocus());
    // Should not throw
    act(() => result.current.blur());
  });

  it('double onFocus stays true', () => {
    const { result } = renderHook(() => useFocus());
    act(() => result.current.onFocus());
    act(() => result.current.onFocus());
    expect(result.current.isFocused).toBe(true);
  });

  it('double onBlur stays false', () => {
    const { result } = renderHook(() => useFocus());
    act(() => result.current.onBlur());
    act(() => result.current.onBlur());
    expect(result.current.isFocused).toBe(false);
  });

  it('focus then blur then focus cycle', () => {
    const { result } = renderHook(() => useFocus());
    act(() => result.current.onFocus());
    expect(result.current.isFocused).toBe(true);
    act(() => result.current.onBlur());
    expect(result.current.isFocused).toBe(false);
    act(() => result.current.onFocus());
    expect(result.current.isFocused).toBe(true);
  });

  it('ref is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useFocus());
    const ref = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(ref);
  });

  it('callbacks stable after state changes', () => {
    const { result } = renderHook(() => useFocus());
    const { onFocus, onBlur, focus, blur } = result.current;
    act(() => result.current.onFocus());
    expect(result.current.onFocus).toBe(onFocus);
    expect(result.current.onBlur).toBe(onBlur);
    expect(result.current.focus).toBe(focus);
    expect(result.current.blur).toBe(blur);
  });

  it('return shape has all expected properties', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isFocused');
    expect(result.current).toHaveProperty('focus');
    expect(result.current).toHaveProperty('blur');
    expect(result.current).toHaveProperty('onFocus');
    expect(result.current).toHaveProperty('onBlur');
  });

  it('focus() calls element.focus() only once', () => {
    const { result } = renderHook(() => useFocus());
    const mockElement = { focus: vi.fn(), blur: vi.fn() } as unknown as HTMLElement;
    (result.current.ref as { current: HTMLElement | null }).current = mockElement;

    act(() => result.current.focus());
    act(() => result.current.focus());
    expect(mockElement.focus).toHaveBeenCalledTimes(2);
  });
});
