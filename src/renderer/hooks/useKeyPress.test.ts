import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyPress, useKeyPressCallback } from './useKeyPress';

afterEach(() => {
  vi.restoreAllMocks();
});

function fireKeyEvent(key: string, type: string = 'keydown', options: Partial<KeyboardEvent> = {}) {
  const event = new KeyboardEvent(type, { key, bubbles: true, ...options });
  window.dispatchEvent(event);
}

describe('useKeyPress', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));
    expect(result.current).toBe(false);
  });

  it('returns true when key is pressed', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(result.current).toBe(true);
  });

  it('returns false when key is released', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(result.current).toBe(true);

    act(() => {
      fireKeyEvent('Enter', 'keyup');
    });

    expect(result.current).toBe(false);
  });

  it('does not respond to different keys', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));

    act(() => {
      fireKeyEvent('Escape', 'keydown');
    });

    expect(result.current).toBe(false);
  });

  it('works with letter keys', () => {
    const { result } = renderHook(() => useKeyPress('a'));

    act(() => {
      fireKeyEvent('a', 'keydown');
    });

    expect(result.current).toBe(true);

    act(() => {
      fireKeyEvent('a', 'keyup');
    });

    expect(result.current).toBe(false);
  });

  it('does not trigger when disabled', () => {
    const { result } = renderHook(() => useKeyPress('Enter', { enabled: false }));

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(result.current).toBe(false);
  });

  it('re-enables when enabled changes', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useKeyPress('Enter', { enabled }),
      { initialProps: { enabled: false } }
    );

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });
    expect(result.current).toBe(false);

    rerender({ enabled: true });

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });
    expect(result.current).toBe(true);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyPress('Enter'));

    unmount();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('handles Shift key', () => {
    const { result } = renderHook(() => useKeyPress('Shift'));

    act(() => {
      fireKeyEvent('Shift', 'keydown');
    });

    expect(result.current).toBe(true);

    act(() => {
      fireKeyEvent('Shift', 'keyup');
    });

    expect(result.current).toBe(false);
  });

  it('resets pressed state when disabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useKeyPress('Enter', { enabled }),
      { initialProps: { enabled: true } }
    );

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });
    expect(result.current).toBe(true);

    rerender({ enabled: false });
    expect(result.current).toBe(false);
  });
});

describe('useKeyPressCallback', () => {
  it('calls callback on key press', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('Enter', callback));

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback for different key', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('Enter', callback));

    act(() => {
      fireKeyEvent('Escape', 'keydown');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('respects ctrl modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('s', callback, { ctrl: true }));

    // Without ctrl - should not trigger
    act(() => {
      fireKeyEvent('s', 'keydown', { ctrlKey: false });
    });
    expect(callback).not.toHaveBeenCalled();

    // With ctrl - should trigger
    act(() => {
      fireKeyEvent('s', 'keydown', { ctrlKey: true });
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('respects shift modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('Enter', callback, { shift: true }));

    act(() => {
      fireKeyEvent('Enter', 'keydown', { shiftKey: false });
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      fireKeyEvent('Enter', 'keydown', { shiftKey: true });
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('Enter', callback, { enabled: false }));

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls preventDefault when option set', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('s', callback, { ctrl: true, preventDefault: true }));

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('uses latest callback reference', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useKeyPressCallback('Enter', cb),
      { initialProps: { cb: cb1 } }
    );

    rerender({ cb: cb2 });

    act(() => {
      fireKeyEvent('Enter', 'keydown');
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyPressCallback('Enter', callback));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('handles multiple modifiers', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressCallback('s', callback, { ctrl: true, shift: true }));

    // Only ctrl, not shift - should not trigger
    act(() => {
      fireKeyEvent('s', 'keydown', { ctrlKey: true, shiftKey: false });
    });
    expect(callback).not.toHaveBeenCalled();

    // Both ctrl and shift
    act(() => {
      fireKeyEvent('s', 'keydown', { ctrlKey: true, shiftKey: true });
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
