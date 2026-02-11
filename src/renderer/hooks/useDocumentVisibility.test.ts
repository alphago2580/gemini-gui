import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentVisibility } from './useDocumentVisibility';

let visibilityStateValue = 'visible';

beforeEach(() => {
  visibilityStateValue = 'visible';
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibilityStateValue,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function triggerVisibilityChange(state: string) {
  visibilityStateValue = state;
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useDocumentVisibility', () => {
  it('returns initial visible state', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current.visibilityState).toBe('visible');
    expect(result.current.isVisible).toBe(true);
    expect(result.current.isHidden).toBe(false);
    expect(result.current.changeCount).toBe(0);
  });

  it('detects when document becomes hidden', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    act(() => {
      triggerVisibilityChange('hidden');
    });

    expect(result.current.visibilityState).toBe('hidden');
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isHidden).toBe(true);
  });

  it('detects when document becomes visible again', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    act(() => { triggerVisibilityChange('hidden'); });
    act(() => { triggerVisibilityChange('visible'); });

    expect(result.current.visibilityState).toBe('visible');
    expect(result.current.isVisible).toBe(true);
    expect(result.current.isHidden).toBe(false);
  });

  it('tracks change count', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current.changeCount).toBe(0);

    act(() => { triggerVisibilityChange('hidden'); });
    expect(result.current.changeCount).toBe(1);

    act(() => { triggerVisibilityChange('visible'); });
    expect(result.current.changeCount).toBe(2);

    act(() => { triggerVisibilityChange('hidden'); });
    expect(result.current.changeCount).toBe(3);
  });

  it('calls onChange callback', () => {
    const onChange = vi.fn();
    renderHook(() => useDocumentVisibility({ onChange }));

    act(() => { triggerVisibilityChange('hidden'); });

    expect(onChange).toHaveBeenCalledWith('hidden');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with visible state', () => {
    const onChange = vi.fn();
    renderHook(() => useDocumentVisibility({ onChange }));

    act(() => { triggerVisibilityChange('hidden'); });
    act(() => { triggerVisibilityChange('visible'); });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('visible');
  });

  it('starts hidden if document is hidden', () => {
    visibilityStateValue = 'hidden';
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current.visibilityState).toBe('hidden');
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isHidden).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useDocumentVisibility());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  it('handles multiple state changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDocumentVisibility({ onChange }));

    act(() => { triggerVisibilityChange('hidden'); });
    act(() => { triggerVisibilityChange('visible'); });
    act(() => { triggerVisibilityChange('hidden'); });
    act(() => { triggerVisibilityChange('visible'); });

    expect(result.current.changeCount).toBe(4);
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(result.current.isVisible).toBe(true);
  });

  it('works without options', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    act(() => { triggerVisibilityChange('hidden'); });

    expect(result.current.isHidden).toBe(true);
  });

  it('uses latest onChange callback', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { rerender } = renderHook(
      ({ onChange }) => useDocumentVisibility({ onChange }),
      { initialProps: { onChange: callback1 } }
    );

    rerender({ onChange: callback2 });

    act(() => { triggerVisibilityChange('hidden'); });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith('hidden');
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current).toHaveProperty('visibilityState');
    expect(result.current).toHaveProperty('isVisible');
    expect(result.current).toHaveProperty('isHidden');
    expect(result.current).toHaveProperty('changeCount');
  });

  it('isVisible and isHidden are mutually exclusive for visible/hidden', () => {
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current.isVisible).toBe(true);
    expect(result.current.isHidden).toBe(false);

    act(() => { triggerVisibilityChange('hidden'); });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isHidden).toBe(true);
  });

  it('handles prerender state', () => {
    visibilityStateValue = 'prerender';
    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current.visibilityState).toBe('prerender');
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isHidden).toBe(false);
  });

  it('changeCount starts at 0', () => {
    const { result } = renderHook(() => useDocumentVisibility());
    expect(result.current.changeCount).toBe(0);
  });
});
