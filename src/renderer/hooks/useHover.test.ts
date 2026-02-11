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

  it('handles multiple enter/leave cycles', () => {
    const { result } = renderHook(() => useHover());
    for (let i = 0; i < 5; i++) {
      act(() => result.current.onMouseEnter());
      expect(result.current.isHovered).toBe(true);
      act(() => result.current.onMouseLeave());
      expect(result.current.isHovered).toBe(false);
    }
  });

  it('calling onMouseEnter twice keeps isHovered true', () => {
    const { result } = renderHook(() => useHover());
    act(() => result.current.onMouseEnter());
    act(() => result.current.onMouseEnter());
    expect(result.current.isHovered).toBe(true);
  });

  it('calling onMouseLeave twice keeps isHovered false', () => {
    const { result } = renderHook(() => useHover());
    act(() => result.current.onMouseLeave());
    act(() => result.current.onMouseLeave());
    expect(result.current.isHovered).toBe(false);
  });

  it('ref is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useHover());
    const ref1 = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(ref1);
  });

  it('ref remains stable after state change', () => {
    const { result } = renderHook(() => useHover());
    const ref1 = result.current.ref;
    act(() => result.current.onMouseEnter());
    expect(result.current.ref).toBe(ref1);
  });

  it('returns correct interface shape', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isHovered');
    expect(result.current).toHaveProperty('onMouseEnter');
    expect(result.current).toHaveProperty('onMouseLeave');
    expect(typeof result.current.isHovered).toBe('boolean');
    expect(typeof result.current.onMouseEnter).toBe('function');
    expect(typeof result.current.onMouseLeave).toBe('function');
  });

  it('leave without prior enter stays false', () => {
    const { result } = renderHook(() => useHover());
    act(() => result.current.onMouseLeave());
    expect(result.current.isHovered).toBe(false);
  });
});
