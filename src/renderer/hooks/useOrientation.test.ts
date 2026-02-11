import { renderHook, act } from '@testing-library/react';
import { useOrientation } from './useOrientation';

describe('useOrientation', () => {
  let mockOrientation: {
    angle: number;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockOrientation = {
      angle: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(screen, 'orientation', {
      value: mockOrientation,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });
  });

  it('initializes as portrait when angle is 0', () => {
    mockOrientation.angle = 0;
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.angle).toBe(0);
  });

  it('reports landscape when angle is 90', () => {
    mockOrientation.angle = 90;
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('landscape');
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.angle).toBe(90);
  });

  it('reports portrait when angle is 180', () => {
    mockOrientation.angle = 180;
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('portrait');
    expect(result.current.angle).toBe(180);
  });

  it('reports landscape when angle is 270', () => {
    mockOrientation.angle = 270;
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('landscape');
    expect(result.current.angle).toBe(270);
  });

  it('listens for orientation change events', () => {
    renderHook(() => useOrientation());
    expect(mockOrientation.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('listens for resize events', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useOrientation());
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    addSpy.mockRestore();
  });

  it('updates on orientation change', () => {
    mockOrientation.angle = 0;
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('portrait');

    // Get the change handler and simulate orientation change
    const changeHandler = mockOrientation.addEventListener.mock.calls[0][1];
    act(() => {
      mockOrientation.angle = 90;
      changeHandler();
    });

    expect(result.current.type).toBe('landscape');
    expect(result.current.angle).toBe(90);
  });

  it('cleans up listeners on unmount', () => {
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOrientation());
    unmount();

    expect(mockOrientation.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    windowRemoveSpy.mockRestore();
  });

  it('falls back to window dimensions when orientation API unavailable', () => {
    Object.defineProperty(screen, 'orientation', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('landscape');
    expect(result.current.angle).toBe(90);
  });

  it('fallback reports portrait when height >= width', () => {
    Object.defineProperty(screen, 'orientation', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true, configurable: true });

    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe('portrait');
    expect(result.current.angle).toBe(0);
  });
});
