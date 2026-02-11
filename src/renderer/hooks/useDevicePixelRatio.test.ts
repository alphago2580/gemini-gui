import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDevicePixelRatio } from './useDevicePixelRatio';

describe('useDevicePixelRatio', () => {
  let originalDevicePixelRatio: number;
  let originalMatchMedia: typeof window.matchMedia;
  let changeHandler: (() => void) | null = null;

  const createMockMatchMedia = (overrides?: Partial<MediaQueryList>): typeof window.matchMedia => {
    return (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, handler: EventListenerOrEventListenerObject) => {
        changeHandler = handler as () => void;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      ...overrides,
    });
  };

  beforeEach(() => {
    originalDevicePixelRatio = window.devicePixelRatio;
    originalMatchMedia = window.matchMedia;
    changeHandler = null;
    window.matchMedia = createMockMatchMedia();
  });

  afterEach(() => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: originalDevicePixelRatio,
      writable: true,
      configurable: true,
    });
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('should return current pixel ratio', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(1);
  });

  it('should detect non-high-DPI display', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.isHighDPI).toBe(false);
    expect(result.current.isRetina).toBe(false);
  });

  it('should detect high-DPI display (1.5x)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1.5, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(1.5);
    expect(result.current.isHighDPI).toBe(true);
    expect(result.current.isRetina).toBe(false);
  });

  it('should detect retina display (2x)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(2);
    expect(result.current.isHighDPI).toBe(true);
    expect(result.current.isRetina).toBe(true);
  });

  it('should detect 3x display as retina', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(3);
    expect(result.current.isRetina).toBe(true);
  });

  it('should update when pixel ratio changes', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(1);

    act(() => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true, configurable: true });
      if (changeHandler) changeHandler();
    });

    expect(result.current.pixelRatio).toBe(2);
    expect(result.current.isRetina).toBe(true);
  });

  it('should call matchMedia to register listener', () => {
    const mockMatchMedia = vi.fn(createMockMatchMedia());
    window.matchMedia = mockMatchMedia;
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    renderHook(() => useDevicePixelRatio());
    expect(mockMatchMedia).toHaveBeenCalled();
  });

  it('should clean up listener on unmount', () => {
    const removeEventListener = vi.fn();
    window.matchMedia = createMockMatchMedia({ removeEventListener });
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });

    const { unmount } = renderHook(() => useDevicePixelRatio());
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should default to 1 when devicePixelRatio is falsy', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 0, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current.pixelRatio).toBe(1);
  });

  it('should return consistent result shape', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current).toHaveProperty('pixelRatio');
    expect(result.current).toHaveProperty('isHighDPI');
    expect(result.current).toHaveProperty('isRetina');
    expect(typeof result.current.pixelRatio).toBe('number');
    expect(typeof result.current.isHighDPI).toBe('boolean');
    expect(typeof result.current.isRetina).toBe('boolean');
  });
});
