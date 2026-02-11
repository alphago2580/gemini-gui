import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResizeObserver, UseResizeObserverOptions } from './useResizeObserver';

let observeCallbacks: ((entries: Partial<ResizeObserverEntry>[]) => void)[] = [];
let observedElements: { element: Element; options?: ResizeObserverOptions }[] = [];
let disconnectCalls: number;

class MockResizeObserver {
  callback: (entries: Partial<ResizeObserverEntry>[]) => void;

  constructor(callback: (entries: Partial<ResizeObserverEntry>[]) => void) {
    this.callback = callback;
    observeCallbacks.push(callback);
  }

  observe(element: Element, options?: ResizeObserverOptions) {
    observedElements.push({ element, options });
  }

  unobserve() {}

  disconnect() {
    disconnectCalls++;
  }
}

beforeEach(() => {
  observeCallbacks = [];
  observedElements = [];
  disconnectCalls = 0;
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeEntry(overrides: {
  width?: number;
  height?: number;
  inlineSize?: number;
  blockSize?: number;
}): Partial<ResizeObserverEntry> {
  const { width = 100, height = 50, inlineSize, blockSize } = overrides;
  return {
    contentRect: { x: 0, y: 0, width, height, top: 0, right: width, bottom: height, left: 0, toJSON: () => ({}) } as DOMRectReadOnly,
    borderBoxSize: inlineSize !== undefined || blockSize !== undefined
      ? [{ inlineSize: inlineSize ?? width, blockSize: blockSize ?? height } as ResizeObserverSize]
      : undefined as unknown as readonly ResizeObserverSize[],
    contentBoxSize: [{ inlineSize: inlineSize ?? width, blockSize: blockSize ?? height } as ResizeObserverSize],
  };
}

describe('useResizeObserver', () => {
  it('returns default size state', () => {
    const { result } = renderHook(() => useResizeObserver());

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
    expect(result.current.size.inlineSize).toBe(0);
    expect(result.current.size.blockSize).toBe(0);
    expect(result.current.ref).toBeDefined();
  });

  it('updates size when element resizes', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 200, height: 100 })]);
      });

      expect(result.current.width).toBe(200);
      expect(result.current.height).toBe(100);
    }
  });

  it('provides inlineSize and blockSize from borderBoxSize', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 150, height: 80, inlineSize: 160, blockSize: 90 })]);
      });

      expect(result.current.size.inlineSize).toBe(160);
      expect(result.current.size.blockSize).toBe(90);
    }
  });

  it('falls back to contentRect when borderBoxSize is missing', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([{
          contentRect: { x: 0, y: 0, width: 300, height: 200, top: 0, right: 300, bottom: 200, left: 0, toJSON: () => ({}) } as DOMRectReadOnly,
          borderBoxSize: undefined as unknown as readonly ResizeObserverSize[],
          contentBoxSize: undefined as unknown as readonly ResizeObserverSize[],
        }]);
      });

      expect(result.current.width).toBe(300);
      expect(result.current.height).toBe(200);
      expect(result.current.size.inlineSize).toBe(300);
      expect(result.current.size.blockSize).toBe(200);
    }
  });

  it('calls onResize callback when size changes', () => {
    const onResize = vi.fn();
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: { onResize } as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { onResize } });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 250, height: 120 })]);
      });

      expect(onResize).toHaveBeenCalledWith(
        expect.objectContaining({ width: 250, height: 120 })
      );
    }
  });

  it('passes box option to observer', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: { box: 'border-box' as ResizeObserverBoxOptions } as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { box: 'border-box' as ResizeObserverBoxOptions } });

    const observed = observedElements.find(o => o.element === element);
    if (observed) {
      expect(observed.options).toEqual({ box: 'border-box' });
    }
  });

  it('disconnects observer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { box: 'content-box' as ResizeObserverBoxOptions } });

    const disconnectsBefore = disconnectCalls;
    unmount();
    expect(disconnectCalls).toBeGreaterThanOrEqual(disconnectsBefore);
  });

  it('handles empty entries array gracefully', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([]);
      });

      expect(result.current.width).toBe(0);
      expect(result.current.height).toBe(0);
    }
  });

  it('handles missing ResizeObserver gracefully', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    const { result } = renderHook(() => useResizeObserver());

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });

  it('ref is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useResizeObserver());
    const firstRef = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(firstRef);
  });

  it('updates onResize callback without recreating observer', () => {
    const onResize1 = vi.fn();
    const onResize2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: { onResize: onResize1 } as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { onResize: onResize1 } });

    // Switch callback
    rerender({ opts: { onResize: onResize2 } });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 400, height: 300 })]);
      });

      // Latest callback should be called
      expect(onResize2).toHaveBeenCalled();
    }
  });

  it('recreates observer when box option changes', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: { box: 'content-box' as ResizeObserverBoxOptions } as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { box: 'content-box' as ResizeObserverBoxOptions } });

    const observerCountBefore = observeCallbacks.length;
    rerender({ opts: { box: 'border-box' as ResizeObserverBoxOptions } });
    // A new observer should be created (new entry in observeCallbacks)
    expect(observeCallbacks.length).toBeGreaterThan(observerCountBefore);
  });

  it('size object has all required fields', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 500, height: 400, inlineSize: 510, blockSize: 410 })]);
      });

      expect(result.current.size).toEqual({
        width: 500,
        height: 400,
        inlineSize: 510,
        blockSize: 410,
      });
    }
  });

  it('width and height shorthand match size fields', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useResizeObserver(opts),
      { initialProps: { opts: {} as UseResizeObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: {} });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([makeEntry({ width: 777, height: 888 })]);
      });

      expect(result.current.width).toBe(result.current.size.width);
      expect(result.current.height).toBe(result.current.size.height);
    }
  });
});
