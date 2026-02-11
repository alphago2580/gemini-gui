import { renderHook, act } from '@testing-library/react';
import { useBreakpoint, defaultBreakpoints } from './useBreakpoint';

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
  window.dispatchEvent(new Event('resize'));
}

describe('useBreakpoint', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  it('returns current breakpoint based on window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('lg');
  });

  it('returns xs for very small widths', () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('xs');
  });

  it('returns sm for width at sm threshold', () => {
    Object.defineProperty(window, 'innerWidth', { value: 640, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('sm');
  });

  it('returns md for width at md threshold', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('md');
  });

  it('returns xl for width at xl threshold', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('xl');
  });

  it('returns 2xl for very large widths', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1600, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('2xl');
  });

  it('reports correct width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(900);
  });

  it('updates on resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.current).toBe('xs');

    act(() => setWindowWidth(1024));
    expect(result.current.current).toBe('lg');
    expect(result.current.width).toBe(1024);
  });

  it('isAbove returns true when width >= breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isAbove('sm')).toBe(true);
    expect(result.current.isAbove('lg')).toBe(true);
    expect(result.current.isAbove('xl')).toBe(false);
  });

  it('isBelow returns true when width < breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 700, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isBelow('md')).toBe(true);
    expect(result.current.isBelow('sm')).toBe(false);
  });

  it('isAt returns true for the exact breakpoint range', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isAt('md')).toBe(true);
    expect(result.current.isAt('sm')).toBe(false);
    expect(result.current.isAt('lg')).toBe(false);
  });

  it('isAt returns true for 2xl (no upper bound)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 2000, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isAt('2xl')).toBe(true);
  });

  it('isBetween works for a range of breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true, configurable: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isBetween('md', 'lg')).toBe(true);
    expect(result.current.isBetween('lg', 'xl')).toBe(false);
    expect(result.current.isBetween('sm', 'xl')).toBe(true);
  });

  it('supports custom breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
    const { result } = renderHook(() =>
      useBreakpoint({ sm: 400, md: 600, lg: 800 })
    );
    expect(result.current.current).toBe('sm');
    expect(result.current.isAbove('sm')).toBe(true);
    expect(result.current.isBelow('md')).toBe(true);
  });

  it('exposes default breakpoints', () => {
    expect(defaultBreakpoints.xs).toBe(0);
    expect(defaultBreakpoints.sm).toBe(640);
    expect(defaultBreakpoints.md).toBe(768);
    expect(defaultBreakpoints.lg).toBe(1024);
    expect(defaultBreakpoints.xl).toBe(1280);
    expect(defaultBreakpoints['2xl']).toBe(1536);
  });

  it('cleans up resize listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useBreakpoint());
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
