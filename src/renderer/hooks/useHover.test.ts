import { renderHook, act } from '@testing-library/react';
import { useHover } from './useHover';

describe('useHover', () => {
  it('initializes with isHovered false', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current.isHovered).toBe(false);
  });

  it('sets isHovered true on onMouseEnter', () => {
    const { result } = renderHook(() => useHover());
    act(() => result.current.onMouseEnter());
    expect(result.current.isHovered).toBe(true);
  });

  it('sets isHovered false on onMouseLeave', () => {
    const { result } = renderHook(() => useHover());
    act(() => result.current.onMouseEnter());
    expect(result.current.isHovered).toBe(true);
    act(() => result.current.onMouseLeave());
    expect(result.current.isHovered).toBe(false);
  });

  it('provides a ref', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useHover());
    const { onMouseEnter, onMouseLeave } = result.current;
    rerender();
    expect(result.current.onMouseEnter).toBe(onMouseEnter);
    expect(result.current.onMouseLeave).toBe(onMouseLeave);
  });
});
