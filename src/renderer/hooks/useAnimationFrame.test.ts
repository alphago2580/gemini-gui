import { renderHook, act } from '@testing-library/react';
import { useAnimationFrame } from './useAnimationFrame';

let rafCallbacks: Array<(time: number) => void> = [];
let nextRafId = 1;

beforeEach(() => {
  rafCallbacks = [];
  nextRafId = 1;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextRafId++;
    rafCallbacks.push(cb);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function flushFrame(time: number): void {
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach(cb => cb(time));
}

describe('useAnimationFrame', () => {
  it('starts not running', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.fps).toBe(0);
  });

  it('starts animation loop when start is called', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('calls callback with delta and elapsed time', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => flushFrame(116));
    expect(cb).toHaveBeenCalledTimes(2);
    // First frame: delta=0 (100-100), elapsed=0 (100-100)
    expect(cb.mock.calls[0][0]).toBe(0);
    expect(cb.mock.calls[0][1]).toBe(0);
    // Second frame: delta=16 (116-100), elapsed=16 (116-100)
    expect(cb.mock.calls[1][0]).toBe(16);
    expect(cb.mock.calls[1][1]).toBe(16);
  });

  it('stops animation loop when stop is called', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => result.current.stop());
    expect(result.current.isRunning).toBe(false);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does not call callback after stop', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => result.current.stop());
    cb.mockClear();
    act(() => flushFrame(200));
    expect(cb).not.toHaveBeenCalled();
  });

  it('updates elapsed time', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(1000));
    act(() => flushFrame(1500));
    expect(result.current.elapsed).toBe(500);
  });

  it('calculates fps', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => flushFrame(116));
    // FPS = 1000 / 16 ≈ 63
    expect(result.current.fps).toBe(Math.round(1000 / 16));
  });

  it('resets elapsed on restart', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => flushFrame(200));
    act(() => result.current.stop());
    act(() => result.current.start());
    expect(result.current.elapsed).toBe(0);
  });

  it('ignores start if already running', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    const callCount = (window.requestAnimationFrame as unknown as { mock: { calls: unknown[][] } }).mock.calls.length;
    act(() => result.current.start());
    const newCallCount = (window.requestAnimationFrame as unknown as { mock: { calls: unknown[][] } }).mock.calls.length;
    expect(newCallCount).toBe(callCount);
  });

  it('cleans up on unmount', () => {
    const cb = vi.fn();
    const { result, unmount } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('returns stable start and stop references', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(() => useAnimationFrame(cb));
    const { start, stop } = result.current;
    rerender();
    expect(result.current.start).toBe(start);
    expect(result.current.stop).toBe(stop);
  });

  it('uses latest callback ref', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useAnimationFrame(cb),
      { initialProps: { cb: cb1 } }
    );
    act(() => result.current.start());
    act(() => flushFrame(100));
    expect(cb1).toHaveBeenCalledTimes(1);
    rerender({ cb: cb2 });
    act(() => flushFrame(116));
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('handles multiple start/stop cycles', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useAnimationFrame(cb));
    act(() => result.current.start());
    act(() => flushFrame(100));
    act(() => result.current.stop());
    // Flush any pending callbacks from before stop (they will early-return due to isRunningRef=false)
    act(() => flushFrame(150));
    cb.mockClear();
    act(() => result.current.start());
    act(() => flushFrame(200));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
