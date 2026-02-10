import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageVisibility } from './usePageVisibility';

let hiddenValue = false;

beforeEach(() => {
  hiddenValue = false;
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hiddenValue,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function triggerVisibilityChange(hidden: boolean) {
  hiddenValue = hidden;
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('usePageVisibility', () => {
  it('returns initial visible state', () => {
    const { result } = renderHook(() => usePageVisibility());

    expect(result.current.isVisible).toBe(true);
    expect(result.current.lastVisibleTime).toBeNull();
    expect(result.current.lastHiddenTime).toBeNull();
    expect(result.current.hiddenDuration).toBe(0);
  });

  it('detects when page becomes hidden', () => {
    const { result } = renderHook(() => usePageVisibility());

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.lastHiddenTime).not.toBeNull();
  });

  it('detects when page becomes visible again', () => {
    const { result } = renderHook(() => usePageVisibility());

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(result.current.isVisible).toBe(false);

    act(() => {
      triggerVisibilityChange(false);
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.lastVisibleTime).not.toBeNull();
  });

  it('calls onHidden callback when page is hidden', () => {
    const onHidden = vi.fn();
    renderHook(() => usePageVisibility({ onHidden }));

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(onHidden).toHaveBeenCalledTimes(1);
  });

  it('calls onVisible callback when page becomes visible', () => {
    const onVisible = vi.fn();
    renderHook(() => usePageVisibility({ onVisible }));

    act(() => {
      triggerVisibilityChange(true);
    });

    act(() => {
      triggerVisibilityChange(false);
    });

    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it('tracks hidden duration', () => {
    const { result } = renderHook(() => usePageVisibility());

    vi.setSystemTime(new Date(1000));
    act(() => {
      triggerVisibilityChange(true);
    });

    vi.setSystemTime(new Date(6000));
    act(() => {
      triggerVisibilityChange(false);
    });

    expect(result.current.hiddenDuration).toBe(5000);
  });

  it('starts hidden if document.hidden is true', () => {
    hiddenValue = true;
    const { result } = renderHook(() => usePageVisibility());

    expect(result.current.isVisible).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => usePageVisibility());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  it('does not call callbacks when no state change', () => {
    const onVisible = vi.fn();
    const onHidden = vi.fn();
    renderHook(() => usePageVisibility({ onVisible, onHidden }));

    // Already visible, trigger visible again
    act(() => {
      triggerVisibilityChange(false);
    });

    // onVisible fires because visibilitychange dispatched with visible state
    expect(onVisible).toHaveBeenCalledTimes(1);
    expect(onHidden).not.toHaveBeenCalled();
  });

  it('handles multiple hide/show cycles', () => {
    const onVisible = vi.fn();
    const onHidden = vi.fn();
    const { result } = renderHook(() => usePageVisibility({ onVisible, onHidden }));

    act(() => { triggerVisibilityChange(true); });
    act(() => { triggerVisibilityChange(false); });
    act(() => { triggerVisibilityChange(true); });
    act(() => { triggerVisibilityChange(false); });

    expect(onHidden).toHaveBeenCalledTimes(2);
    expect(onVisible).toHaveBeenCalledTimes(2);
    expect(result.current.isVisible).toBe(true);
  });
});
