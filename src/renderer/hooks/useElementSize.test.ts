import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElementSize } from './useElementSize';

let resizeCallback: ((entries: Array<{ contentRect: { width: number; height: number } }>) => void) | null = null;
let mockObserve: ReturnType<typeof vi.fn>;
let mockDisconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resizeCallback = null;
  mockObserve = vi.fn();
  mockDisconnect = vi.fn();

  globalThis.ResizeObserver = class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback as unknown as typeof resizeCallback;
    }
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useElementSize', () => {
  it('returns initial size of 0x0', () => {
    const { result } = renderHook(() => useElementSize());

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });

  it('returns a ref callback', () => {
    const { result } = renderHook(() => useElementSize());

    expect(typeof result.current.ref).toBe('function');
  });

  it('observes element when ref is attached', () => {
    const { result } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 });

    act(() => {
      result.current.ref(element);
    });

    expect(mockObserve).toHaveBeenCalledWith(element);
  });

  it('sets initial size from getBoundingClientRect', () => {
    const { result } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    act(() => {
      result.current.ref(element);
    });

    expect(result.current.width).toBe(200);
    expect(result.current.height).toBe(100);
  });

  it('updates size on resize', () => {
    const { result } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 });

    act(() => {
      result.current.ref(element);
    });

    act(() => {
      if (resizeCallback) {
        resizeCallback([{ contentRect: { width: 300, height: 150 } }]);
      }
    });

    expect(result.current.width).toBe(300);
    expect(result.current.height).toBe(150);
  });

  it('disconnects observer when ref is set to null', () => {
    const { result } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 });

    act(() => {
      result.current.ref(element);
    });

    act(() => {
      result.current.ref(null);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('disconnects on unmount', () => {
    const { result, unmount } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 });

    act(() => {
      result.current.ref(element);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('creates new observer when element changes', () => {
    const { result } = renderHook(() => useElementSize());

    const element1 = document.createElement('div');
    element1.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 });

    const element2 = document.createElement('div');
    element2.getBoundingClientRect = vi.fn().mockReturnValue({ width: 200, height: 100 });

    act(() => {
      result.current.ref(element1);
    });

    act(() => {
      result.current.ref(element2);
    });

    // Disconnect should be called when switching elements
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(element2);
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useElementSize());

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('width');
    expect(result.current).toHaveProperty('height');
  });

  it('ref is a stable function reference', () => {
    const { result, rerender } = renderHook(() => useElementSize());

    const ref1 = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(ref1);
  });

  it('handles element with zero dimensions', () => {
    const { result } = renderHook(() => useElementSize());

    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 0 });

    act(() => {
      result.current.ref(element);
    });

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });
});
