import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMousePosition } from './useMousePosition';

function createMouseEvent(x: number, y: number): MouseEvent {
  return new MouseEvent('mousemove', {
    clientX: x,
    clientY: y,
    bubbles: true,
  });
}

describe('useMousePosition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial position state', () => {
    const { result } = renderHook(() => useMousePosition());
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.elementX).toBe(0);
    expect(result.current.elementY).toBe(0);
    expect(result.current.isInside).toBe(false);
  });

  it('tracks mouse position on window', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      window.dispatchEvent(createMouseEvent(150, 200));
    });

    expect(result.current.x).toBe(150);
    expect(result.current.y).toBe(200);
  });

  it('tracks mouse position relative to element', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 100,
      width: 200,
      height: 300,
      right: 250,
      bottom: 400,
      x: 50,
      y: 100,
      toJSON: () => ({}),
    });

    const ref = { current: div };
    const { result } = renderHook(() => useMousePosition(ref));

    act(() => {
      div.dispatchEvent(createMouseEvent(100, 200));
    });

    expect(result.current.x).toBe(100);
    expect(result.current.y).toBe(200);
    expect(result.current.elementX).toBe(50);
    expect(result.current.elementY).toBe(100);
  });

  it('detects isInside true when mouse is inside element', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const ref = { current: div };
    const { result } = renderHook(() => useMousePosition(ref));

    act(() => {
      div.dispatchEvent(createMouseEvent(100, 100));
    });

    expect(result.current.isInside).toBe(true);
  });

  it('detects isInside false when mouse is outside element', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      right: 300,
      bottom: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    const ref = { current: div };
    const { result } = renderHook(() => useMousePosition(ref));

    act(() => {
      div.dispatchEvent(createMouseEvent(50, 50));
    });

    expect(result.current.isInside).toBe(false);
    expect(result.current.elementX).toBe(-50);
    expect(result.current.elementY).toBe(-50);
  });

  it('isInside true at element boundary (edge)', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const ref = { current: div };
    const { result } = renderHook(() => useMousePosition(ref));

    act(() => {
      div.dispatchEvent(createMouseEvent(0, 0));
    });

    expect(result.current.isInside).toBe(true);
    expect(result.current.elementX).toBe(0);
    expect(result.current.elementY).toBe(0);
  });

  it('isInside true at element bottom-right corner', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const ref = { current: div };
    const { result } = renderHook(() => useMousePosition(ref));

    act(() => {
      div.dispatchEvent(createMouseEvent(100, 100));
    });

    expect(result.current.isInside).toBe(true);
    expect(result.current.elementX).toBe(100);
    expect(result.current.elementY).toBe(100);
  });

  it('throttles mouse events', () => {
    const { result } = renderHook(() => useMousePosition(undefined, 100));

    act(() => {
      window.dispatchEvent(createMouseEvent(10, 20));
    });

    // Should not update yet (throttled)
    expect(result.current.x).toBe(0);

    act(() => {
      window.dispatchEvent(createMouseEvent(30, 40));
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // After throttle expires, should have latest position
    expect(result.current.x).toBe(30);
    expect(result.current.y).toBe(40);
  });

  it('processes immediately when throttleMs is 0', () => {
    const { result } = renderHook(() => useMousePosition(undefined, 0));

    act(() => {
      window.dispatchEvent(createMouseEvent(50, 60));
    });

    expect(result.current.x).toBe(50);
    expect(result.current.y).toBe(60);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useMousePosition());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('cleans up event listener on element unmount', () => {
    const div = document.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}),
    });

    const removeSpy = vi.spyOn(div, 'removeEventListener');
    const ref = { current: div };
    const { unmount } = renderHook(() => useMousePosition(ref));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('clears throttle timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useMousePosition(undefined, 200));

    act(() => {
      window.dispatchEvent(createMouseEvent(10, 10));
    });

    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('return shape matches MousePosition interface', () => {
    const { result } = renderHook(() => useMousePosition());
    expect(result.current).toHaveProperty('x');
    expect(result.current).toHaveProperty('y');
    expect(result.current).toHaveProperty('elementX');
    expect(result.current).toHaveProperty('elementY');
    expect(result.current).toHaveProperty('isInside');
  });

  it('updates position on multiple moves', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      window.dispatchEvent(createMouseEvent(10, 20));
    });
    expect(result.current.x).toBe(10);

    act(() => {
      window.dispatchEvent(createMouseEvent(30, 40));
    });
    expect(result.current.x).toBe(30);

    act(() => {
      window.dispatchEvent(createMouseEvent(50, 60));
    });
    expect(result.current.x).toBe(50);
    expect(result.current.y).toBe(60);
  });

  it('no element ref returns zero for elementX/elementY', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      window.dispatchEvent(createMouseEvent(100, 200));
    });

    expect(result.current.elementX).toBe(0);
    expect(result.current.elementY).toBe(0);
    expect(result.current.isInside).toBe(false);
  });

  it('handles negative throttle as no-throttle', () => {
    const { result } = renderHook(() => useMousePosition(undefined, -10));

    act(() => {
      window.dispatchEvent(createMouseEvent(42, 84));
    });

    expect(result.current.x).toBe(42);
    expect(result.current.y).toBe(84);
  });
});
