import { renderHook, act } from '@testing-library/react';
import { useWindowSize } from './useWindowSize';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true });
  });

  it('returns current window dimensions', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('updates on window resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(800);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(900);
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowSize());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('handles multiple resizes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true });

    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(600);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 700, writable: true });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(700);
  });

  it('updates height independently when only height changes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.height).toBe(768);

    act(() => {
      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(500);
  });

  it('returns WindowSize interface shape with width and height', () => {
    const { result } = renderHook(() => useWindowSize());
    expect(typeof result.current.width).toBe('number');
    expect(typeof result.current.height).toBe('number');
    expect(Object.keys(result.current).sort()).toEqual(['height', 'width']);
  });

  it('does not throw when resize fires after unmount', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

    const { unmount } = renderHook(() => useWindowSize());
    unmount();

    expect(() => {
      window.dispatchEvent(new Event('resize'));
    }).not.toThrow();
  });

  it('registers exactly one resize listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useWindowSize());

    const resizeCalls = addSpy.mock.calls.filter(([event]) => event === 'resize');
    expect(resizeCalls.length).toBe(1);
    addSpy.mockRestore();
  });

  it('handles very small dimensions', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1, writable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(1);
    expect(result.current.height).toBe(1);
  });

  it('handles very large dimensions', () => {
    Object.defineProperty(window, 'innerWidth', { value: 7680, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 4320, writable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(7680);
    expect(result.current.height).toBe(4320);
  });

  it('both width and height update simultaneously on resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1920);
    expect(result.current.height).toBe(1080);
  });
});
