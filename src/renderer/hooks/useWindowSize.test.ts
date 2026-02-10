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
});
