import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { usePageLeave } from './usePageLeave';

function createMouseLeaveEvent(clientX: number, clientY: number): MouseEvent {
  return new MouseEvent('mouseleave', {
    clientX,
    clientY,
    bubbles: true,
  });
}

describe('usePageLeave', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state with hasLeft false', () => {
    const { result } = renderHook(() => usePageLeave());
    expect(result.current.hasLeft).toBe(false);
    expect(result.current.leaveCount).toBe(0);
  });

  it('detects mouse leaving from top', () => {
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });

    expect(result.current.hasLeft).toBe(true);
    expect(result.current.leaveCount).toBe(1);
  });

  it('detects mouse leaving from left', () => {
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(0, 100));
    });

    expect(result.current.hasLeft).toBe(true);
  });

  it('detects mouse leaving from right', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(1024, 100));
    });

    expect(result.current.hasLeft).toBe(true);
  });

  it('detects mouse leaving from bottom', () => {
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 768));
    });

    expect(result.current.hasLeft).toBe(true);
  });

  it('increments leave count on multiple leaves', () => {
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });
    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(0, 100));
    });
    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });

    expect(result.current.leaveCount).toBe(3);
  });

  it('calls onLeave callback', () => {
    const onLeave = vi.fn();
    renderHook(() => usePageLeave(onLeave));

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('reset() clears hasLeft and leaveCount', () => {
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });
    expect(result.current.hasLeft).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.hasLeft).toBe(false);
    expect(result.current.leaveCount).toBe(0);
  });

  it('does not trigger for interior mouse leave events', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(500, 400));
    });

    expect(result.current.hasLeft).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => usePageLeave());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('reset is stable across renders', () => {
    const { result, rerender } = renderHook(() => usePageLeave());
    const firstReset = result.current.reset;
    rerender();
    expect(result.current.reset).toBe(firstReset);
  });

  it('return shape matches UsePageLeaveResult', () => {
    const { result } = renderHook(() => usePageLeave());
    expect(result.current).toHaveProperty('hasLeft');
    expect(result.current).toHaveProperty('leaveCount');
    expect(result.current).toHaveProperty('reset');
    expect(typeof result.current.reset).toBe('function');
  });

  it('negative coordinates trigger leave', () => {
    const { result } = renderHook(() => usePageLeave());

    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(-5, 100));
    });

    expect(result.current.hasLeft).toBe(true);
  });

  it('uses latest onLeave callback without re-registering listener', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const onLeave1 = vi.fn();
    const onLeave2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => usePageLeave(cb),
      { initialProps: { cb: onLeave1 } }
    );

    const addCallCount = addSpy.mock.calls.filter(c => c[0] === 'mouseleave').length;

    // Re-render with a new callback
    rerender({ cb: onLeave2 });

    // Listener should NOT be re-registered
    const newAddCallCount = addSpy.mock.calls.filter(c => c[0] === 'mouseleave').length;
    expect(newAddCallCount).toBe(addCallCount);

    // But the new callback should be called
    act(() => {
      document.dispatchEvent(createMouseLeaveEvent(100, 0));
    });

    expect(onLeave1).not.toHaveBeenCalled();
    expect(onLeave2).toHaveBeenCalledTimes(1);
    addSpy.mockRestore();
  });
});
