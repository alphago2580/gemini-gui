import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

let mockFullscreenElement: Element | null = null;
let mockRequestFullscreen: ReturnType<typeof vi.fn>;
let mockExitFullscreen: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFullscreenElement = null;
  mockRequestFullscreen = vi.fn(async () => {
    mockFullscreenElement = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  mockExitFullscreen = vi.fn(async () => {
    mockFullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  Object.defineProperty(document, 'fullscreenElement', {
    get: () => mockFullscreenElement,
    configurable: true,
  });

  document.documentElement.requestFullscreen = mockRequestFullscreen as unknown as typeof document.documentElement.requestFullscreen;
  Object.defineProperty(document, 'exitFullscreen', {
    value: mockExitFullscreen,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFullscreen', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it('enters fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enter();
    });

    expect(mockRequestFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(true);
  });

  it('exits fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enter();
    });
    expect(result.current.isFullscreen).toBe(true);

    await act(async () => {
      await result.current.exit();
    });
    expect(mockExitFullscreen).toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(false);
  });

  it('toggles fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isFullscreen).toBe(true);

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('calls onEnter callback', async () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useFullscreen({ onEnter }));

    await act(async () => {
      await result.current.enter();
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onExit callback', async () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useFullscreen({ onExit }));

    await act(async () => {
      await result.current.enter();
    });
    await act(async () => {
      await result.current.exit();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('handles enter error', async () => {
    mockRequestFullscreen.mockRejectedValue(new Error('Not allowed'));
    const onError = vi.fn();
    const { result } = renderHook(() => useFullscreen({ onError }));

    await act(async () => {
      await result.current.enter();
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not allowed' }));
  });

  it('uses target element ref', async () => {
    const element = document.createElement('div');
    element.requestFullscreen = vi.fn(async () => {
      mockFullscreenElement = element;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const ref = { current: element };

    const { result } = renderHook(() => useFullscreen({ targetRef: ref }));

    await act(async () => {
      await result.current.enter();
    });

    expect(element.requestFullscreen).toHaveBeenCalled();
    expect(mockRequestFullscreen).not.toHaveBeenCalled();
  });

  it('exit does nothing when not fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.exit();
    });

    expect(mockExitFullscreen).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useFullscreen());
    expect(addSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('responds to external fullscreen changes', () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => {
      mockFullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(result.current.isFullscreen).toBe(true);

    act(() => {
      mockFullscreenElement = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(result.current.isFullscreen).toBe(false);
  });
});
