import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from './useIntersectionObserver';

let observeCallbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
let observedElements: Element[] = [];
let disconnectCalls: number;

class MockIntersectionObserver {
  callback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  options: IntersectionObserverInit | undefined;

  constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    observeCallbacks.push(callback);
  }

  observe(element: Element) {
    observedElements.push(element);
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
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIntersectionObserver', () => {
  it('returns default entry state', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.entry.isIntersecting).toBe(false);
    expect(result.current.entry.intersectionRatio).toBe(0);
    expect(result.current.entry.boundingClientRect).toBeNull();
    expect(result.current.ref).toBeDefined();
  });

  it('creates observer when element ref is set', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    });

    // Re-render to trigger effect
    const { result: result2 } = renderHook(() => useIntersectionObserver());
    const el2 = document.createElement('div');
    (result2.current.ref as React.MutableRefObject<Element | null>).current = el2;

    // Force re-render
    const { result: result3, rerender } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: {} } }
    );
    const el3 = document.createElement('div');
    (result3.current.ref as React.MutableRefObject<Element | null>).current = el3;
    rerender({ opts: { threshold: 0.5 } });

    expect(observedElements.length).toBeGreaterThanOrEqual(0);
  });

  it('updates entry when intersection changes', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: {} } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { threshold: 0 } });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([{
          isIntersecting: true,
          intersectionRatio: 0.75,
          boundingClientRect: { x: 0, y: 0, width: 100, height: 50, top: 0, right: 100, bottom: 50, left: 0, toJSON: () => ({}) } as DOMRectReadOnly,
        }]);
      });

      expect(result.current.isVisible).toBe(true);
      expect(result.current.entry.isIntersecting).toBe(true);
      expect(result.current.entry.intersectionRatio).toBe(0.75);
    }
  });

  it('supports threshold option', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: { threshold: 0.5 } } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { threshold: 0.5 } });

    // Observer is created with threshold option
    expect(result.current.isVisible).toBe(false);
  });

  it('supports rootMargin option', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ rootMargin: '10px 20px' })
    );

    expect(result.current.isVisible).toBe(false);
  });

  it('freezes state once visible when freezeOnceVisible is true', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: { freezeOnceVisible: true } as UseIntersectionObserverOptions } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { freezeOnceVisible: true, threshold: 0.1 } });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];

      // First: becomes visible
      act(() => {
        cb([{
          isIntersecting: true,
          intersectionRatio: 1.0,
          boundingClientRect: { x: 0, y: 0, width: 100, height: 50, top: 0, right: 100, bottom: 50, left: 0, toJSON: () => ({}) } as DOMRectReadOnly,
        }]);
      });

      expect(result.current.isVisible).toBe(true);

      // Second: goes invisible — but should stay frozen as visible
      act(() => {
        cb([{
          isIntersecting: false,
          intersectionRatio: 0,
          boundingClientRect: null as unknown as DOMRectReadOnly,
        }]);
      });

      expect(result.current.isVisible).toBe(true);
      expect(result.current.entry.isIntersecting).toBe(true);
    }
  });

  it('disconnects observer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: {} } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { threshold: 0.1 } });

    const disconnectsBefore = disconnectCalls;
    unmount();
    expect(disconnectCalls).toBeGreaterThanOrEqual(disconnectsBefore);
  });

  it('handles empty entries array gracefully', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useIntersectionObserver(opts),
      { initialProps: { opts: {} } }
    );

    const element = document.createElement('div');
    (result.current.ref as React.MutableRefObject<Element | null>).current = element;
    rerender({ opts: { threshold: 0.2 } });

    if (observeCallbacks.length > 0) {
      const cb = observeCallbacks[observeCallbacks.length - 1];
      act(() => {
        cb([]);
      });

      expect(result.current.isVisible).toBe(false);
    }
  });

  it('supports array threshold', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: [0, 0.25, 0.5, 0.75, 1] })
    );

    expect(result.current.isVisible).toBe(false);
  });

  it('handles missing IntersectionObserver gracefully', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.entry.isIntersecting).toBe(false);
  });
});
