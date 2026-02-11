import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

beforeEach(() => {
  vi.restoreAllMocks();
});

function fireEvent(element: HTMLElement, eventType: string = 'mousedown') {
  const event = new MouseEvent(eventType, { bubbles: true });
  Object.defineProperty(event, 'target', { value: element, writable: false });
  document.dispatchEvent(event);
}

describe('useClickOutside', () => {
  it('returns a ref object', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });

  it('calls callback when clicking outside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    // Attach ref
    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => {
      fireEvent(outside);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('does not call callback when clicking inside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const inside = document.createElement('div');
    const child = document.createElement('span');
    inside.appendChild(child);
    document.body.appendChild(inside);

    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => {
      fireEvent(child);
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(inside);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback, { enabled: false }));

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => {
      fireEvent(outside);
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('respects custom event type', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback, { eventType: 'mouseup' }));

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    // mousedown should not trigger
    act(() => {
      fireEvent(outside, 'mousedown');
    });
    expect(callback).not.toHaveBeenCalled();

    // mouseup should trigger
    act(() => {
      fireEvent(outside, 'mouseup');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('does not call callback when ref is not attached', () => {
    const callback = vi.fn();
    renderHook(() => useClickOutside(callback));

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    act(() => {
      fireEvent(outside);
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(outside);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const callback = vi.fn();
    const { unmount } = renderHook(() => useClickOutside(callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('handles multiple clicks outside', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => { fireEvent(outside); });
    act(() => { fireEvent(outside); });
    act(() => { fireEvent(outside); });

    expect(callback).toHaveBeenCalledTimes(3);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('uses latest callback', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useClickOutside(cb),
      { initialProps: { cb: callback1 } }
    );

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    rerender({ cb: callback2 });

    act(() => {
      fireEvent(outside);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('default eventType is mousedown', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const callback = vi.fn();
    renderHook(() => useClickOutside(callback));

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('enabled defaults to true', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => {
      fireEvent(outside);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('clicking the element itself does not trigger', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const element = document.createElement('div');
    document.body.appendChild(element);

    (result.current as { current: HTMLElement | null }).current = element;

    act(() => {
      fireEvent(element);
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('re-enables when enabled changes to true', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useClickOutside(callback, { enabled }),
      { initialProps: { enabled: false } }
    );

    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    (result.current as { current: HTMLElement | null }).current = inside;

    act(() => { fireEvent(outside); });
    expect(callback).not.toHaveBeenCalled();

    rerender({ enabled: true });

    act(() => { fireEvent(outside); });
    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });
});
