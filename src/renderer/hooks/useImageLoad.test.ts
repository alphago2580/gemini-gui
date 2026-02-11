import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageLoad } from './useImageLoad';

interface MockImage {
  src: string;
  crossOrigin: string | null;
  referrerPolicy: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  naturalWidth: number;
  naturalHeight: number;
}

let mockImages: MockImage[];
let OriginalImage: typeof Image;

beforeEach(() => {
  mockImages = [];
  OriginalImage = globalThis.Image;
  (globalThis as Record<string, unknown>).Image = class {
    src = '';
    crossOrigin: string | null = null;
    referrerPolicy = '';
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    naturalWidth = 0;
    naturalHeight = 0;
    constructor() {
      mockImages.push(this as unknown as MockImage);
    }
  };
});

afterEach(() => {
  globalThis.Image = OriginalImage;
  vi.restoreAllMocks();
});

function getLastImage() {
  return mockImages[mockImages.length - 1];
}

function simulateLoad(img: ReturnType<typeof getLastImage>, width = 800, height = 600) {
  img.naturalWidth = width;
  img.naturalHeight = height;
  const loadHandler = img.addEventListener.mock.calls.find(
    (c: unknown[]) => c[0] === 'load'
  )?.[1] as ((e: Event) => void) | undefined;
  loadHandler?.(new Event('load'));
}

function simulateError(img: ReturnType<typeof getLastImage>) {
  const errorHandler = img.addEventListener.mock.calls.find(
    (c: unknown[]) => c[0] === 'error'
  )?.[1] as ((e: Event) => void) | undefined;
  errorHandler?.(new Event('error'));
}

describe('useImageLoad', () => {
  it('returns initial state for undefined src', () => {
    const { result } = renderHook(() => useImageLoad(undefined));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.naturalWidth).toBe(0);
    expect(result.current.naturalHeight).toBe(0);
  });

  it('sets loading state when src is provided', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('sets loaded state on successful load', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));
    const img = getLastImage();

    act(() => {
      simulateLoad(img, 1024, 768);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.naturalWidth).toBe(1024);
    expect(result.current.naturalHeight).toBe(768);
  });

  it('sets error state on load failure', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/bad.png'));
    const img = getLastImage();

    act(() => {
      simulateError(img);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('Failed to load image: https://example.com/bad.png');
  });

  it('calls onLoad callback', () => {
    const onLoad = vi.fn();
    renderHook(() =>
      useImageLoad('https://example.com/img.png', { onLoad })
    );
    const img = getLastImage();

    act(() => {
      simulateLoad(img);
    });

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    renderHook(() =>
      useImageLoad('https://example.com/bad.png', { onError })
    );
    const img = getLastImage();

    act(() => {
      simulateError(img);
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('sets crossOrigin when provided', () => {
    renderHook(() =>
      useImageLoad('https://example.com/img.png', { crossOrigin: 'anonymous' })
    );
    const img = getLastImage();

    expect(img.crossOrigin).toBe('anonymous');
  });

  it('sets referrerPolicy when provided', () => {
    renderHook(() =>
      useImageLoad('https://example.com/img.png', { referrerPolicy: 'no-referrer' })
    );
    const img = getLastImage();

    expect(img.referrerPolicy).toBe('no-referrer');
  });

  it('does not set crossOrigin when not provided', () => {
    renderHook(() => useImageLoad('https://example.com/img.png'));
    const img = getLastImage();

    expect(img.crossOrigin).toBeNull();
  });

  it('sets img src', () => {
    renderHook(() => useImageLoad('https://example.com/img.png'));
    const img = getLastImage();

    expect(img.src).toBe('https://example.com/img.png');
  });

  it('reloads image when reload is called', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));

    expect(mockImages).toHaveLength(1);

    act(() => {
      result.current.reload();
    });

    expect(mockImages).toHaveLength(2);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useImageLoad('https://example.com/img.png'));
    const img = getLastImage();

    unmount();

    expect(img.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(img.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('resets state when src changes', () => {
    const { result, rerender } = renderHook(
      ({ src }) => useImageLoad(src),
      { initialProps: { src: 'https://example.com/a.png' } }
    );

    const img1 = getLastImage();
    act(() => {
      simulateLoad(img1, 100, 200);
    });

    expect(result.current.isLoaded).toBe(true);

    rerender({ src: 'https://example.com/b.png' });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoaded).toBe(false);
  });

  it('resets all state when src becomes undefined', () => {
    const { result, rerender } = renderHook(
      ({ src }) => useImageLoad(src),
      { initialProps: { src: 'https://example.com/a.png' as string | undefined } }
    );

    const img1 = getLastImage();
    act(() => {
      simulateLoad(img1, 100, 200);
    });

    rerender({ src: undefined });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.naturalWidth).toBe(0);
    expect(result.current.naturalHeight).toBe(0);
  });

  it('uses latest callback references', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ onLoad }) => useImageLoad('https://example.com/img.png', { onLoad }),
      { initialProps: { onLoad: cb1 } }
    );

    rerender({ onLoad: cb2 });

    const img = getLastImage();
    act(() => {
      simulateLoad(img);
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));

    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isLoaded');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('naturalWidth');
    expect(result.current).toHaveProperty('naturalHeight');
    expect(result.current).toHaveProperty('reload');
  });

  it('handles reload after error', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));

    act(() => {
      simulateError(getLastImage());
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.reload();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('natural dimensions default to 0', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));

    expect(result.current.naturalWidth).toBe(0);
    expect(result.current.naturalHeight).toBe(0);
  });

  it('error is null when no error', () => {
    const { result } = renderHook(() => useImageLoad('https://example.com/img.png'));
    const img = getLastImage();

    act(() => {
      simulateLoad(img);
    });

    expect(result.current.error).toBeNull();
  });
});
