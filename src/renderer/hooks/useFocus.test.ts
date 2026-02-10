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
});
